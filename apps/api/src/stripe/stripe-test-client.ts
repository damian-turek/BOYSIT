import { randomUUID } from 'node:crypto'
import type Stripe from 'stripe'
import { vi } from 'vitest'

export const testSubscription = (
  userId: string,
  customerId: string,
  status: Stripe.Subscription.Status = 'active',
  id = 'sub_test',
) =>
  ({
    id,
    customer: customerId,
    metadata: { userId },
    status,
    cancel_at_period_end: false,
    items: { data: [{ price: { id: 'price_pro' }, current_period_end: 1800000000 }] },
  }) as unknown as Stripe.Subscription

export const testEvent = (subscription: Stripe.Subscription, id = `evt_test_${randomUUID()}`) =>
  ({
    id,
    created: Math.floor(Date.now() / 1000),
    type: 'customer.subscription.updated',
    data: { object: structuredClone(subscription) },
  }) as Stripe.Event

export const createStripeTestClient = () => {
  const subscriptions = new Map<string, Stripe.Subscription>()
  const sessions = new Map<string, Stripe.Checkout.Session>()
  const customerKeys = new Map<string, Stripe.Customer>()
  const sessionKeys = new Map<string, Stripe.Checkout.Session>()
  const createCustomer = vi.fn(
    async (_params: Stripe.CustomerCreateParams, options: Stripe.RequestOptions) => {
      const key = options.idempotencyKey!
      if (!customerKeys.has(key))
        customerKeys.set(key, { id: `cus_${randomUUID()}` } as Stripe.Customer)
      return customerKeys.get(key)!
    },
  )
  const createSession = vi.fn(
    async (params: Stripe.Checkout.SessionCreateParams, options: Stripe.RequestOptions) => {
      const key = options.idempotencyKey!
      if (!sessionKeys.has(key)) {
        const session = {
          id: `cs_${randomUUID()}`,
          url: 'https://checkout.stripe.test/session',
          status: 'open',
          mode: 'subscription',
          customer: params.customer,
          metadata: params.metadata,
        } as Stripe.Checkout.Session
        sessionKeys.set(key, session)
        sessions.set(session.id, session)
      }
      return sessionKeys.get(key)!
    },
  )
  const retrieveSession = vi.fn(async (id: string) => {
    const session = sessions.get(id)
    if (!session) throw new Error('Unknown test session')
    return session
  })
  const listSubscriptions = vi.fn(async function* (params: Stripe.SubscriptionListParams) {
    for (const subscription of subscriptions.values()) {
      if (subscription.customer === params.customer) yield structuredClone(subscription)
    }
  })
  const cancelSubscription = vi.fn(async (id: string) => {
    const subscription = subscriptions.get(id)
    if (!subscription) throw new Error('Unknown test subscription')
    const canceled = { ...subscription, status: 'canceled' } as Stripe.Subscription
    subscriptions.set(id, canceled)
    return canceled
  })
  const listSessions = vi.fn(async function* (params: Stripe.Checkout.SessionListParams) {
    for (const session of sessions.values()) {
      if (session.customer === params.customer && session.status === params.status) yield session
    }
  })
  const client = {
    customers: { create: createCustomer },
    subscriptions: { list: listSubscriptions, cancel: cancelSubscription },
    checkout: {
      sessions: { create: createSession, retrieve: retrieveSession, list: listSessions },
    },
  } as unknown as Stripe
  return {
    client,
    subscriptions,
    sessions,
    customerKeys,
    sessionKeys,
    createCustomer,
    createSession,
    retrieveSession,
    listSubscriptions,
    cancelSubscription,
    listSessions,
  }
}
