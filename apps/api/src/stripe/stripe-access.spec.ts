import type Stripe from 'stripe'
import { describe, expect, it } from 'vitest'

import { grantsProAccess } from './stripe-access'

const expectedAccess = {
  active: true,
  canceled: false,
  incomplete: false,
  incomplete_expired: false,
  past_due: false,
  paused: false,
  trialing: false,
  unpaid: false,
} satisfies Record<Stripe.Subscription.Status, boolean>

describe('grantsProAccess', () => {
  it.each(Object.entries(expectedAccess))('%s grants Pro: %s', (status, expected) => {
    expect(grantsProAccess(status as Stripe.Subscription.Status)).toBe(expected)
  })
})
