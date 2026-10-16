import type Stripe from 'stripe'

// The product has no trial or payment-retry grace period.
export const grantsProAccess = (status: Stripe.Subscription.Status): boolean => status === 'active'
