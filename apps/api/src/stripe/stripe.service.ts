import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SubscriptionStatus, User, UserPlan } from 'database'
import Stripe from 'stripe'

import { PrismaService } from '../prisma/prisma.service'
import { CreateCheckoutSessionDto } from './dto/checkout-session.dto'
import { STRIPE_CLIENT } from './stripe.constants'
import { findPlanById, findPlanByPriceId } from './stripe-plans'

// past_due keeps access during Stripe's payment-retry grace period.
const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription.Status[] = ['trialing', 'active', 'past_due']

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name)

  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Creates a Stripe Checkout session for a subscription plan, tied to the
   * currently authenticated user via client_reference_id + metadata so the
   * webhook can always find who to update, even without a DB round trip.
   */
  async createSubscriptionCheckout(user: User, dto: CreateCheckoutSessionDto) {
    const plan = findPlanById(dto.planId, this.configService)

    if (!plan) {
      throw new BadRequestException(`Unknown plan "${dto.planId}"`)
    }

    if (!plan.priceId) {
      throw new BadRequestException(
        `Plan "${dto.planId}" has no Stripe price configured. Set the matching STRIPE_PRICE_* environment variable.`,
      )
    }

    // Reuse the Stripe customer from a previous subscription if we have one,
    // so the user doesn't end up with duplicate customers in Stripe.
    const existingSubscription = await this.prismaService.client.subscription.findFirst({
      where: { userId: user.id, stripeCustomerId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: { stripeCustomerId: true },
    })

    // Absolute URLs are built here, server-side, from our own trusted
    // APP_URL - never from client input (see the comment on
    // CreateCheckoutSessionDto.returnPath for why).
    const appUrl = (this.configService.get<string>('APP_URL') ?? 'http://localhost:3000').replace(
      /\/+$/,
      '',
    )
    const returnUrl = `${appUrl}${dto.returnPath}`
    const separator = returnUrl.includes('?') ? '&' : '?'

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${returnUrl}${separator}checkout=success`,
      cancel_url: `${returnUrl}${separator}checkout=cancelled`,
      client_reference_id: user.id,
      ...(existingSubscription?.stripeCustomerId
        ? { customer: existingSubscription.stripeCustomerId }
        : { customer_email: user.email }),
      metadata: { userId: user.id, planId: plan.id },
      subscription_data: {
        metadata: { userId: user.id, planId: plan.id },
      },
    })

    return session
  }

  constructWebhookEvent(payload: Buffer, signature: string, webhookSecret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  /**
   * Single entry point for the webhook controller. Keeps the User.plan /
   * User.proUntil fields (and the Subscription row) in sync with Stripe.
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Received Stripe webhook event: ${event.type} (${event.id})`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription' || !session.subscription) break

        const subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id

        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)
        await this.syncSubscription(subscription, session.client_reference_id ?? undefined)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await this.syncSubscription(subscription)
        break
      }

      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`)
    }
  }

  private async syncSubscription(subscription: Stripe.Subscription, fallbackUserId?: string) {
    const userId = (subscription.metadata?.userId as string | undefined) ?? fallbackUserId

    if (!userId) {
      this.logger.warn(
        `Stripe subscription ${subscription.id} has no userId metadata and no fallback - skipping sync`,
      )
      return
    }

    const priceId = subscription.items.data[0]?.price?.id
    const plan = findPlanByPriceId(priceId, this.configService)

    if (!plan) {
      this.logger.warn(
        `No configured plan matches Stripe price "${priceId}" (subscription ${subscription.id}). ` +
          'Check that STRIPE_PRICE_PRO_MONTHLY in .env matches the price actually used at checkout ' +
          '(test-mode vs live-mode price IDs are different).',
      )
    }

    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id

    // Stripe moved `current_period_end` from the subscription to the
    // subscription item in newer API versions - support both shapes.
    const currentPeriodEndSeconds =
      (subscription.items.data[0] as unknown as { current_period_end?: number })?.current_period_end ??
      (subscription as unknown as { current_period_end?: number }).current_period_end
    const currentPeriodEnd = currentPeriodEndSeconds ? new Date(currentPeriodEndSeconds * 1000) : null

    await this.prismaService.client.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        userId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        stripeCustomerId: customerId,
        stripePriceId: priceId,
        status: subscription.status as SubscriptionStatus,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })

    this.logger.log(
      `Synced subscription ${subscription.id} for user ${userId}: status=${subscription.status}, plan=${plan?.plan ?? 'unmatched'}`,
    )

    await this.syncUserPlan(userId, subscription.status, plan?.plan, currentPeriodEnd)
  }

  private async syncUserPlan(
    userId: string,
    status: Stripe.Subscription.Status,
    mappedPlan: UserPlan | undefined,
    currentPeriodEnd: Date | null,
  ) {
    const user = await this.prismaService.client.user.findUnique({ where: { id: userId } })

    if (!user) {
      this.logger.warn(`Stripe subscription references unknown user ${userId} (no such row in "users")`)
      return
    }

    // Never let a Stripe event downgrade an admin account.
    if (user.plan === 'admin') return

    const isActive = ACTIVE_SUBSCRIPTION_STATUSES.includes(status)

    if (isActive && mappedPlan) {
      await this.prismaService.client.user.update({
        where: { id: userId },
        data: { plan: mappedPlan, proUntil: currentPeriodEnd },
      })
      return
    }

    // canceled / incomplete / incomplete_expired / unpaid -> back to free.
    await this.prismaService.client.user.update({
      where: { id: userId },
      data: { plan: 'free', proUntil: null },
    })
  }
}
