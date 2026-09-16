import { ConfigService } from '@nestjs/config'
import { UserPlan } from 'database'

export interface StripePlanDefinition {
  /** Identifier sent by the frontend (pricing tile -> planId). */
  id: string
  /** Plan the user is granted while a subscription on this price is active. */
  plan: UserPlan
  /** Stripe Price ID (price_...) - configured via env, may be undefined until set up in Stripe. */
  priceId?: string
}

/**
 * Central place mapping our internal plan ids to Stripe Price IDs.
 * Add a new entry here (+ matching env var) whenever a new paid tier is introduced.
 */
const getStripePlanDefinitions = (configService: ConfigService): StripePlanDefinition[] => [
  {
    id: 'pro_monthly',
    plan: 'pro',
    priceId: configService.get<string>('STRIPE_PRICE_PRO_MONTHLY'),
  },
]

export const findPlanById = (
  planId: string,
  configService: ConfigService,
): StripePlanDefinition | undefined =>
  getStripePlanDefinitions(configService).find((plan) => plan.id === planId)

export const findPlanByPriceId = (
  priceId: string | null | undefined,
  configService: ConfigService,
): StripePlanDefinition | undefined => {
  if (!priceId) return undefined
  return getStripePlanDefinitions(configService).find((plan) => plan.priceId === priceId)
}
