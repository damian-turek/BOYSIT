import { ConfigService } from '@nestjs/config'
import type { Prisma, User } from 'database'
import type Stripe from 'stripe'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { createStripeTestClient, testEvent, testSubscription } from './stripe-test-client'
import { StripeService } from './stripe.service'

const userId = '5bf4e958-1555-40cd-a8de-f8f6641ab4f1'
const periodEnd = new Date(1800000000 * 1000)

describe('StripeService subscription access', () => {
  const upsert = vi.fn()
  const updateMany = vi.fn()
  const recordEvent = vi.fn()
  const findUser = vi.fn()
  let fake: ReturnType<typeof createStripeTestClient>
  let service: StripeService

  beforeEach(() => {
    vi.resetAllMocks()
    fake = createStripeTestClient()
    recordEvent.mockResolvedValue({ count: 1 })
    findUser.mockResolvedValue({ id: userId })
    const tx = {
      $queryRaw: vi.fn().mockResolvedValue([{ id: userId }]),
      billingAccount: {
        findUnique: vi.fn().mockResolvedValue({ userId, stripeCustomerId: 'cus_test' }),
        upsert: vi.fn().mockResolvedValue({ userId, stripeCustomerId: 'cus_test' }),
      },
      stripeWebhookEvent: { createMany: recordEvent },
      subscription: { upsert, findUnique: vi.fn().mockResolvedValue(null) },
      user: { findUnique: findUser, updateMany },
    }
    service = new StripeService(
      fake.client,
      new ConfigService({ STRIPE_PRICE_PRO_MONTHLY: 'price_pro' }),
      {
        client: {
          $transaction: (fn: (tx: Prisma.TransactionClient) => Promise<unknown>) =>
            fn(tx as unknown as Prisma.TransactionClient),
          billingAccount: {
            findUnique: vi.fn().mockResolvedValue({ stripeCustomerId: 'cus_test' }),
          },
        },
      } as unknown as PrismaService,
    )
  })

  const deliver = async (status: Stripe.Subscription.Status, cancelAtPeriodEnd = false) => {
    const subscription = testSubscription(userId, 'cus_test', status)
    subscription.cancel_at_period_end = cancelAtPeriodEnd
    fake.subscriptions.set(subscription.id, subscription)
    await service.handleWebhookEvent(testEvent(subscription))
  }

  it('grants Pro for an active configured subscription without modifying administrators', async () => {
    await deliver('active')
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: userId, plan: { not: 'admin' } },
      data: { plan: 'pro', proUntil: periodEnd },
    })
  })
  it.each([
    'past_due',
    'trialing',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired',
    'paused',
  ] as const)('revokes Pro and clears expiry for %s', async (status) => {
    await deliver(status)
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ status }) }),
    )
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: userId, plan: { not: 'admin' } },
      data: { plan: 'free', proUntil: null },
    })
  })
  it('restores Pro after payment recovery', async () => {
    await deliver('past_due')
    await deliver('active')
    expect(updateMany.mock.calls.map(([args]) => args.data.plan)).toEqual(['free', 'pro'])
  })
  it('keeps Pro until a scheduled cancellation actually ends the subscription', async () => {
    await deliver('active', true)
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { plan: 'pro', proUntil: periodEnd } }),
    )
  })
  it('skips processed events before calling Stripe', async () => {
    recordEvent.mockResolvedValue({ count: 0 })
    await deliver('active')
    expect(fake.listSubscriptions).not.toHaveBeenCalled()
    expect(upsert).not.toHaveBeenCalled()
    expect(updateMany).not.toHaveBeenCalled()
  })
  it('uses current state rather than the stale webhook snapshot', async () => {
    const subscription = testSubscription(userId, 'cus_test', 'active')
    const staleEvent = testEvent(subscription)
    subscription.status = 'canceled'
    fake.subscriptions.set(subscription.id, subscription)
    await service.handleWebhookEvent(staleEvent)
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { plan: 'free', proUntil: null } }),
    )
  })
  it('keeps access from a new subscription when an old cancellation arrives', async () => {
    const old = testSubscription(userId, 'cus_test', 'canceled', 'sub_old')
    const current = testSubscription(userId, 'cus_test', 'active', 'sub_current')
    fake.subscriptions.set(old.id, old)
    fake.subscriptions.set(current.id, current)
    await service.handleWebhookEvent(testEvent(old))
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { plan: 'pro', proUntil: periodEnd } }),
    )
  })
  it('fails for a missing subscription so the webhook can be retried', async () => {
    await expect(
      service.handleWebhookEvent(testEvent(testSubscription(userId, 'cus_test'))),
    ).rejects.toThrow('missing')
    expect(updateMany).not.toHaveBeenCalled()
  })
  it('rejects an active unconfigured price so Stripe can retry after configuration is fixed', async () => {
    const subscription = testSubscription(userId, 'cus_test')
    subscription.items.data[0]!.price.id = 'price_unknown'
    fake.subscriptions.set(subscription.id, subscription)
    await expect(service.handleWebhookEvent(testEvent(subscription))).rejects.toThrow(
      'unconfigured Price ID',
    )
    expect(updateMany).not.toHaveBeenCalled()
  })
  it('cancels a live subscription before account deletion', async () => {
    const subscription = testSubscription(userId, 'cus_test', 'active')
    fake.subscriptions.set(subscription.id, subscription)

    await service.cancelSubscriptionsForAccountDeletion({ id: userId } as User)

    expect(fake.cancelSubscription).toHaveBeenCalledWith(
      subscription.id,
      { invoice_now: false, prorate: false },
      expect.objectContaining({ timeout: 5000 }),
    )
  })
  it('acknowledges a terminal cancellation webhook after its user was deleted', async () => {
    findUser.mockResolvedValue(null)
    const subscription = testSubscription(userId, 'cus_test', 'canceled')
    fake.subscriptions.set(subscription.id, subscription)

    await expect(service.handleWebhookEvent(testEvent(subscription))).resolves.toBeUndefined()
    expect(updateMany).not.toHaveBeenCalled()
  })
})
