import { ConfigService } from '@nestjs/config'
import type { DatabaseClient, User } from 'database'
import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { createStripeTestClient, testEvent, testSubscription } from './stripe-test-client'
import type { StripeService } from './stripe.service'

const testUrl = process.env.STRIPE_TEST_DATABASE_URL

describe.skipIf(!testUrl)('Stripe lifecycle with PostgreSQL', () => {
  let db: DatabaseClient
  let Service: typeof StripeService
  let service: StripeService
  let fake: ReturnType<typeof createStripeTestClient>
  let user: User
  let customerId: string
  const config = new ConfigService({
    STRIPE_PRICE_PRO_MONTHLY: 'price_pro',
    APP_URL: 'http://localhost:3000',
  })
  const dto = { planId: 'pro_monthly', returnPath: '/pl/dashboard/profile' }

  beforeAll(async () => {
    const url = new URL(testUrl!)
    if (
      !['localhost', '127.0.0.1'].includes(url.hostname) ||
      url.pathname !== '/boysit_stripe_test'
    ) {
      throw new Error(
        'Stripe integration tests require a disposable localhost database named boysit_stripe_test',
      )
    }
    // Set both before importing any runtime database module; never use the application .env database.
    process.env.DIRECT_URL = testUrl
    process.env.DATABASE_URL = testUrl
    db = (await import('database')).prisma
    Service = (await import('./stripe.service.js')).StripeService
    await db.$connect()
  })

  afterAll(async () => {
    await db?.$disconnect()
  })

  beforeEach(async () => {
    fake = createStripeTestClient()
    user = await db.user.create({ data: { email: `stripe-${randomUUID()}@example.test` } })
    customerId = `cus_${randomUUID()}`
    await db.billingAccount.create({ data: { userId: user.id, stripeCustomerId: customerId } })
    service = new Service(fake.client, config, { client: db } as PrismaService)
  })

  const subscription = (
    status: Stripe.Subscription.Status = 'active',
    id = `sub_${randomUUID()}`,
  ) => {
    const value = testSubscription(user.id, customerId, status, id)
    fake.subscriptions.set(value.id, value)
    return value
  }

  it('backfills the existing customer without losing the historical subscription', async () => {
    const migrated = await db.billingAccount.findUniqueOrThrow({
      where: { userId: '00000000-0000-4000-8000-000000000001' },
    })
    expect(migrated.stripeCustomerId).toBe('cus_before_migration')
    expect(
      await db.subscription.count({ where: { stripeSubscriptionId: 'sub_before_migration' } }),
    ).toBe(1)
  })

  it('processes simultaneous duplicate events exactly once', async () => {
    const event = testEvent(subscription())
    await Promise.all(Array.from({ length: 4 }, () => service.handleWebhookEvent(event)))
    expect(await db.stripeWebhookEvent.count({ where: { eventId: event.id } })).toBe(1)
    expect(fake.listSubscriptions).toHaveBeenCalledTimes(1)
    expect(await db.subscription.count({ where: { userId: user.id } })).toBe(1)
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('pro')
  })

  it('handles Checkout completion using current subscription state and account ownership', async () => {
    const current = subscription('past_due')
    current.metadata = {}
    const event = {
      id: `evt_test_${randomUUID()}`,
      created: Math.floor(Date.now() / 1000),
      type: 'checkout.session.completed',
      data: {
        object: {
          mode: 'subscription',
          customer: customerId,
          subscription: current.id,
          client_reference_id: user.id,
        },
      },
    } as Stripe.Event
    await service.handleWebhookEvent(event)
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('free')
    expect(await db.stripeWebhookEvent.count({ where: { eventId: event.id } })).toBe(1)
  })

  it('stores paused subscriptions without granting access', async () => {
    const current = subscription('paused')
    await service.handleWebhookEvent(testEvent(current))
    expect(
      (await db.subscription.findUniqueOrThrow({ where: { stripeSubscriptionId: current.id } }))
        .status,
    ).toBe('paused')
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('free')
  })

  it('rolls back the event and subscription when updating access fails, then allows replay', async () => {
    const event = testEvent(subscription())
    await db.$executeRawUnsafe(
      "ALTER TABLE users ADD CONSTRAINT stripe_test_reject_pro CHECK (plan <> 'pro') NOT VALID",
    )
    try {
      await expect(service.handleWebhookEvent(event)).rejects.toThrow()
      expect(await db.stripeWebhookEvent.count({ where: { eventId: event.id } })).toBe(0)
      expect(await db.subscription.count({ where: { userId: user.id } })).toBe(0)
      expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('free')
    } finally {
      await db.$executeRawUnsafe('ALTER TABLE users DROP CONSTRAINT stripe_test_reject_pro')
    }
    await service.handleWebhookEvent(event)
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('pro')
  })

  it('does not consume the event when Stripe is unavailable', async () => {
    const event = testEvent(subscription())
    fake.listSubscriptions.mockImplementationOnce(async function* () {
      throw new Error('Stripe unavailable')
    })
    await expect(service.handleWebhookEvent(event)).rejects.toThrow('Stripe unavailable')
    expect(await db.stripeWebhookEvent.count({ where: { eventId: event.id } })).toBe(0)
    await service.handleWebhookEvent(event)
    expect(await db.stripeWebhookEvent.count({ where: { eventId: event.id } })).toBe(1)
  })

  it('ignores stale snapshot status even for events with equal timestamps', async () => {
    const current = subscription('active')
    const stale = testEvent(current)
    current.status = 'canceled'
    const newer = testEvent(current)
    stale.created = newer.created
    await service.handleWebhookEvent(newer)
    await service.handleWebhookEvent(stale)
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('free')
  })

  it('serializes different events before fetching Stripe state', async () => {
    const current = subscription('active')
    let release!: () => void
    let entered!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const started = new Promise<void>((resolve) => {
      entered = resolve
    })
    fake.listSubscriptions.mockImplementationOnce(async function* () {
      const snapshot = structuredClone(current)
      entered()
      await gate
      yield snapshot
    })
    const first = service.handleWebhookEvent(testEvent(current))
    await started
    current.status = 'canceled'
    const second = service.handleWebhookEvent(testEvent(current))
    try {
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(fake.listSubscriptions).toHaveBeenCalledTimes(1)
    } finally {
      release()
    }
    await Promise.all([first, second])
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('free')
  })

  it('stores two subscriptions for the same customer and retains access from the active one', async () => {
    const old = subscription('canceled')
    subscription('active')
    await service.handleWebhookEvent(testEvent(old))
    expect(
      await db.subscription.count({ where: { userId: user.id, stripeCustomerId: customerId } }),
    ).toBe(2)
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('pro')
  })

  it('preserves administrator access', async () => {
    await db.user.update({ where: { id: user.id }, data: { plan: 'admin' } })
    await service.handleWebhookEvent(testEvent(subscription('past_due')))
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).plan).toBe('admin')
  })

  it('rejects a conflicting owner without storing the event', async () => {
    const current = subscription()
    current.metadata.userId = randomUUID()
    const event = testEvent(current)
    await expect(service.handleWebhookEvent(event)).rejects.toThrow('owner')
    expect(await db.stripeWebhookEvent.count({ where: { eventId: event.id } })).toBe(0)
  })

  it('creates one customer and one Checkout for simultaneous requests', async () => {
    await db.billingAccount.delete({ where: { userId: user.id } })
    const sessions = await Promise.all(
      Array.from({ length: 4 }, () => {
        const instance = new Service(fake.client, config, { client: db } as PrismaService)
        return instance.createSubscriptionCheckout(user, dto)
      }),
    )
    expect(new Set(sessions.map(({ id }) => id)).size).toBe(1)
    expect(fake.createCustomer).toHaveBeenCalledTimes(1)
    expect(fake.createSession).toHaveBeenCalledTimes(1)
    expect(await db.stripeCheckoutAttempt.count({ where: { userId: user.id } })).toBe(1)
  })

  it.each(['active', 'past_due', 'unpaid', 'trialing', 'incomplete', 'paused'] as const)(
    'blocks a second purchase for %s even before any webhook arrives',
    async (status) => {
      subscription(status)
      await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow('already exists')
      expect(fake.createSession).not.toHaveBeenCalled()
    },
  )

  it('allows purchasing again after cancellation using the same customer', async () => {
    const first = await service.createSubscriptionCheckout(user, dto)
    const old = subscription('canceled')
    first.status = 'complete'
    first.subscription = old.id
    const second = await service.createSubscriptionCheckout(user, dto)
    expect(second.id).not.toBe(first.id)
    expect(second.customer).toBe(customerId)
    expect(fake.createCustomer).not.toHaveBeenCalled()
    expect(await db.stripeCheckoutAttempt.count({ where: { userId: user.id } })).toBe(2)
  })

  it('replaces an expired session while reusing an open session across locales', async () => {
    const first = await service.createSubscriptionCheckout(user, dto)
    expect(
      (await service.createSubscriptionCheckout(user, { ...dto, returnPath: '/en/dashboard' })).id,
    ).toBe(first.id)
    first.status = 'expired'
    expect((await service.createSubscriptionCheckout(user, dto)).id).not.toBe(first.id)
  })

  it('blocks a legacy open Checkout that has no local attempt', async () => {
    fake.sessions.set('cs_legacy', {
      id: 'cs_legacy',
      customer: customerId,
      mode: 'subscription',
      status: 'open',
      metadata: {},
    } as Stripe.Checkout.Session)
    await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow('earlier Checkout')
    expect(fake.createSession).not.toHaveBeenCalled()
  })

  it('retains request identity and parameters when Stripe succeeds but the database write fails', async () => {
    await db.$executeRawUnsafe(
      'ALTER TABLE stripe_checkout_attempts ADD CONSTRAINT stripe_test_fail_session CHECK (stripe_checkout_session_id IS NULL) NOT VALID',
    )
    try {
      await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow()
      expect(await db.stripeCheckoutAttempt.count({ where: { userId: user.id } })).toBe(1)
      expect(fake.sessionKeys.size).toBe(1)
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE stripe_checkout_attempts DROP CONSTRAINT stripe_test_fail_session',
      )
    }
    service = new Service(fake.client, config, { client: db } as PrismaService)
    const recovered = await service.createSubscriptionCheckout(user, {
      ...dto,
      returnPath: '/en/dashboard',
    })
    expect(fake.sessionKeys.size).toBe(1)
    expect(fake.createSession.mock.calls[1]).toEqual(fake.createSession.mock.calls[0])
    expect(
      (await db.stripeCheckoutAttempt.findFirstOrThrow({ where: { userId: user.id } }))
        .stripeCheckoutSessionId,
    ).toBe(recovered.id)
  })

  it('reuses customer idempotency after a failed database write', async () => {
    await db.billingAccount.update({ where: { userId: user.id }, data: { stripeCustomerId: null } })
    await db.$executeRawUnsafe(
      'ALTER TABLE billing_accounts ADD CONSTRAINT stripe_test_fail_customer CHECK (stripe_customer_id IS NULL) NOT VALID',
    )
    try {
      await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow()
      expect(fake.customerKeys.size).toBe(1)
    } finally {
      await db.$executeRawUnsafe(
        'ALTER TABLE billing_accounts DROP CONSTRAINT stripe_test_fail_customer',
      )
    }
    await service.createSubscriptionCheckout(user, dto)
    expect(fake.customerKeys.size).toBe(1)
    expect(fake.createCustomer.mock.calls[1]).toEqual(fake.createCustomer.mock.calls[0])
  })

  it('recovers the same Checkout when Stripe created it but its response was lost', async () => {
    const create = fake.createSession.getMockImplementation()!
    fake.createSession.mockImplementationOnce(async (params, options) => {
      await create(params, options)
      throw new Error('Lost Stripe response')
    })
    await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow(
      'Lost Stripe response',
    )
    service = new Service(fake.client, config, { client: db } as PrismaService)
    await service.createSubscriptionCheckout(user, dto)
    expect(fake.sessionKeys.size).toBe(1)
    expect(fake.createSession.mock.calls[1]).toEqual(fake.createSession.mock.calls[0])
  })

  it('blocks unresolved customer creation beyond the safe retry window', async () => {
    await db.billingAccount.update({
      where: { userId: user.id },
      data: {
        stripeCustomerId: null,
        customerRequestStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    })
    await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow('reconciliation')
    expect(fake.createCustomer).not.toHaveBeenCalled()
  })

  it('requires reconciliation instead of reusing an uncertain expired idempotency key', async () => {
    fake.createSession.mockRejectedValueOnce(new Error('Network timeout'))
    await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow('Network timeout')
    await db.stripeCheckoutAttempt.updateMany({
      where: { userId: user.id },
      data: { createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
    await expect(service.createSubscriptionCheckout(user, dto)).rejects.toThrow('reconciliation')
    expect(fake.createSession).toHaveBeenCalledTimes(1)
  })
})
