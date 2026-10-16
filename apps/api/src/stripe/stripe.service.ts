import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import { Prisma, SubscriptionStatus } from 'database'
import type { StripeCheckoutAttempt, User } from 'database'
import Stripe from 'stripe'

import { PrismaService } from '../prisma/prisma.service'
import { CreateCheckoutSessionDto } from './dto/checkout-session.dto'
import { grantsProAccess } from './stripe-access'
import { findPlanById, findPlanByPriceId } from './stripe-plans'
import { STRIPE_CLIENT } from './stripe.constants'

export type InvoiceSummary = {
  id: string
  number: string | null
  amountPaid: number
  currency: string
  status: Stripe.Invoice.Status | null
  created: string
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

export type BillingStatus = {
  customerExists: boolean
  subscription: {
    status: SubscriptionStatus
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
}

const transactionOptions = { maxWait: 5000, timeout: 30000 }
const stripeRequestOptions = { timeout: 5000, maxNetworkRetries: 1 }
const terminalSubscriptionStatuses = new Set<Stripe.Subscription.Status>([
  'canceled',
  'incomplete_expired',
])
// Stripe may prune idempotency keys after 24 hours. Stop before an uncertain retry can duplicate a purchase.
const safeRetryWindowMs = 23 * 60 * 60 * 1000

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

    // Absolute URLs are built here, server-side, from our own trusted
    // APP_URL - never from client input (see the comment on
    // CreateCheckoutSessionDto.returnPath for why).
    const appUrl = (this.configService.get<string>('APP_URL') ?? 'http://localhost:3000').replace(
      /\/+$/,
      '',
    )
    const returnUrl = `${appUrl}${dto.returnPath}`
    const separator = returnUrl.includes('?') ? '&' : '?'

    // Automatic tax requires Stripe Tax to be turned on (with an origin
    // address set) in the Stripe Dashboard first - until then, leave it off
    // via env so checkout doesn't start failing. Billing address collection
    // is safe to always request; it's what automatic tax uses to work out
    // the right VAT rate once enabled.
    const automaticTaxEnabled =
      this.configService.get<string>('STRIPE_AUTOMATIC_TAX_ENABLED') === 'true'

    // Commit the customer request identity before making an external write.
    await this.prismaService.client.$transaction(async (tx) => {
      await this.lockUser(tx, user.id)
      await tx.billingAccount.createMany({
        data: { userId: user.id },
        skipDuplicates: true,
      })
    }, transactionOptions)

    const customerId = await this.prismaService.client.$transaction(async (tx) => {
      await this.lockUser(tx, user.id)
      const account = await tx.billingAccount.findUniqueOrThrow({ where: { userId: user.id } })
      if (account.stripeCustomerId) return account.stripeCustomerId

      this.assertSafeRetry(account.customerRequestStartedAt)
      const customer = await this.stripe.customers.create(
        { metadata: { userId: user.id } },
        { ...stripeRequestOptions, idempotencyKey: `billing-customer:${user.id}` },
      )
      await tx.billingAccount.update({
        where: { userId: user.id },
        data: { stripeCustomerId: customer.id },
      })
      return customer.id
    }, transactionOptions)

    // Persist immutable Checkout parameters before calling Stripe. A failed response or DB commit
    // must retry the same purchase, even after a process restart or a change of locale/configuration.
    const priceId = plan.priceId
    const attempt = await this.prismaService.client.$transaction(async (tx) => {
      await this.lockUser(tx, user.id)
      const subscriptions = await this.assertNoSubscription(customerId)
      const previous = await tx.stripeCheckoutAttempt.findFirst({
        where: { userId: user.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      })
      if (previous) {
        if (!previous.stripeCheckoutSessionId) return previous
        const session = await this.stripe.checkout.sessions.retrieve(
          previous.stripeCheckoutSessionId,
          {},
          stripeRequestOptions,
        )
        if (session.status === 'open') return previous
        if (session.status === 'complete') {
          const previousSubscriptionId =
            typeof session.subscription === 'string'
              ? session.subscription
              : session.subscription?.id
          if (!subscriptions.some(({ id }) => id === previousSubscriptionId)) {
            throw new ConflictException('The previous Checkout is still being processed.')
          }
        } else if (session.status !== 'expired') {
          throw new ServiceUnavailableException('Unexpected Checkout session status')
        }
      }
      return tx.stripeCheckoutAttempt.create({
        data: {
          userId: user.id,
          priceId,
          planId: plan.id,
          successUrl: `${returnUrl}${separator}checkout=success`,
          cancelUrl: `${returnUrl}${separator}checkout=cancelled`,
          automaticTax: automaticTaxEnabled,
        },
      })
    }, transactionOptions)

    const session = await this.prismaService.client.$transaction(async (tx) => {
      await this.lockUser(tx, user.id)
      await this.assertNoSubscription(customerId)
      const latest = await tx.stripeCheckoutAttempt.findFirstOrThrow({
        where: { userId: user.id },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      })
      if (latest.id !== attempt.id) {
        throw new ConflictException('Checkout has changed. Retry to use the current session.')
      }
      let session: Stripe.Checkout.Session
      if (latest.stripeCheckoutSessionId) {
        session = await this.stripe.checkout.sessions.retrieve(
          latest.stripeCheckoutSessionId,
          {},
          stripeRequestOptions,
        )
      } else {
        this.assertSafeRetry(latest.createdAt)
        session = await this.stripe.checkout.sessions.create(
          this.checkoutParameters(latest, customerId),
          { ...stripeRequestOptions, idempotencyKey: `billing-checkout:${latest.id}` },
        )
        await tx.stripeCheckoutAttempt.update({
          where: { id: latest.id },
          data: { stripeCheckoutSessionId: session.id },
        })
      }
      return session
    }, transactionOptions)
    if (session.status !== 'open' || !session.url) {
      throw new ConflictException('Checkout is already completed or expired. Refresh billing.')
    }
    return session
  }

  private checkoutParameters(
    attempt: StripeCheckoutAttempt,
    customerId: string,
  ): Stripe.Checkout.SessionCreateParams {
    return {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: attempt.priceId, quantity: 1 }],
      success_url: attempt.successUrl,
      cancel_url: attempt.cancelUrl,
      client_reference_id: attempt.userId,
      billing_address_collection: 'required',
      ...(attempt.automaticTax ? { automatic_tax: { enabled: true } } : {}),
      metadata: { userId: attempt.userId, planId: attempt.planId, checkoutAttemptId: attempt.id },
      subscription_data: { metadata: { userId: attempt.userId, planId: attempt.planId } },
    }
  }

  private assertSafeRetry(startedAt: Date) {
    if (Date.now() - startedAt.getTime() >= safeRetryWindowMs) {
      throw new ConflictException({
        code: 'BILLING_RECONCILIATION_REQUIRED',
        message:
          'An earlier billing request needs reconciliation. Contact support before retrying.',
      })
    }
  }

  private async currentSubscriptions(customerId: string): Promise<Stripe.Subscription[]> {
    const result: Stripe.Subscription[] = []
    for await (const subscription of this.stripe.subscriptions.list(
      { customer: customerId, status: 'all', limit: 100 },
      stripeRequestOptions,
    ))
      result.push(subscription)
    return result
  }

  private async assertNoSubscription(customerId: string) {
    const subscriptions = await this.currentSubscriptions(customerId)
    if (
      subscriptions.some(({ status }) => status !== 'canceled' && status !== 'incomplete_expired')
    ) {
      throw new ConflictException({
        code: 'BILLING_SUBSCRIPTION_EXISTS',
        message: 'A subscription already exists. Manage it through the billing portal.',
      })
    }
    // Cover sessions created before this implementation, which have no local attempt record.
    for await (const session of this.stripe.checkout.sessions.list(
      { customer: customerId, status: 'open', limit: 100 },
      stripeRequestOptions,
    )) {
      if (session.mode === 'subscription' && !session.metadata?.checkoutAttemptId) {
        throw new ConflictException(
          'An earlier Checkout session is still open. Complete or expire it first.',
        )
      }
    }
    return subscriptions
  }

  private async lockUser(tx: Prisma.TransactionClient, userId: string) {
    const users = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM users WHERE id = ${userId}::uuid FOR UPDATE
    `
    if (users.length !== 1)
      throw new ServiceUnavailableException('Billing user could not be resolved')
  }

  constructWebhookEvent(payload: Buffer, signature: string, webhookSecret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  }

  /**
   * Stripe's hosted "Customer Portal" - lets an existing subscriber cancel,
   * change plan, or update their card without us building any of that UI.
   * The return URL is always our own trusted APP_URL, never client input.
   */
  async createBillingPortalSession(user: User, returnPath: string) {
    const existingSubscription = await this.prismaService.client.billingAccount.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    })

    if (!existingSubscription?.stripeCustomerId) {
      throw new BadRequestException(
        'No Stripe customer found for this account yet - subscribe to a plan first.',
      )
    }

    const appUrl = (this.configService.get<string>('APP_URL') ?? 'http://localhost:3000').replace(
      /\/+$/,
      '',
    )

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: existingSubscription.stripeCustomerId,
      return_url: `${appUrl}${returnPath}`,
    })

    return portalSession
  }

  async getBillingStatus(user: User): Promise<BillingStatus> {
    const [account, subscriptions] = await Promise.all([
      this.prismaService.client.billingAccount.findUnique({
        where: { userId: user.id },
        select: { stripeCustomerId: true },
      }),
      this.prismaService.client.subscription.findMany({
        where: { userId: user.id },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      }),
    ])

    const current =
      subscriptions.find(({ status }) => status === SubscriptionStatus.active) ??
      subscriptions.find(
        ({ status }) =>
          status !== SubscriptionStatus.canceled &&
          status !== SubscriptionStatus.incomplete_expired,
      ) ??
      subscriptions[0]

    return {
      customerExists: Boolean(account?.stripeCustomerId),
      subscription: current
        ? {
            status: current.status,
            currentPeriodEnd: current.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: current.cancelAtPeriodEnd,
          }
        : null,
    }
  }

  async cancelSubscriptionsForAccountDeletion(user: User): Promise<void> {
    const account = await this.prismaService.client.billingAccount.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    })
    if (!account?.stripeCustomerId) return

    const subscriptions = await this.currentSubscriptions(account.stripeCustomerId)
    for (const subscription of subscriptions) {
      if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
        continue
      }
      await this.stripe.subscriptions.cancel(
        subscription.id,
        { invoice_now: false, prorate: false },
        stripeRequestOptions,
      )
    }
  }

  async listInvoices(user: User): Promise<InvoiceSummary[]> {
    const existingSubscription = await this.prismaService.client.billingAccount.findUnique({
      where: { userId: user.id },
      select: { stripeCustomerId: true },
    })

    if (!existingSubscription?.stripeCustomerId) return []

    const invoices = await this.stripe.invoices.list({
      customer: existingSubscription.stripeCustomerId,
      limit: 12,
    })

    return invoices.data.map((invoice) => ({
      id: invoice.id ?? invoice.number ?? randomUUID(),
      number: invoice.number,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      created: new Date(invoice.created * 1000).toISOString(),
      hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
      invoicePdf: invoice.invoice_pdf ?? null,
    }))
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Received Stripe webhook event: ${event.type} (${event.id})`)
    let subscriptionId: string
    let customerId: string
    let fallbackUserId: string | undefined
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode !== 'subscription' || !session.subscription || !session.customer) return

        subscriptionId =
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id

        customerId = typeof session.customer === 'string' ? session.customer : session.customer.id
        fallbackUserId = session.client_reference_id ?? session.metadata?.userId
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        subscriptionId = subscription.id
        customerId =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id
        fallbackUserId = subscription.metadata?.userId
        break
      }

      default:
        return
    }

    await this.prismaService.client.$transaction(async (tx) => {
      // The unique key also serializes concurrent delivery of the same event. If anything below
      // fails, this insert rolls back and Stripe can safely retry the entire operation.
      const inserted = await tx.stripeWebhookEvent.createMany({
        data: {
          eventId: event.id,
          type: event.type,
          stripeCreatedAt: new Date(event.created * 1000),
        },
        skipDuplicates: true,
      })
      if (inserted.count === 0) return

      const owner = await tx.billingAccount.findUnique({ where: { stripeCustomerId: customerId } })
      const existing = await tx.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      })
      const userId = owner?.userId ?? existing?.userId ?? fallbackUserId
      if (
        !userId ||
        (fallbackUserId && fallbackUserId !== userId) ||
        (existing && existing.userId !== userId)
      ) {
        throw new ServiceUnavailableException('Stripe subscription owner could not be resolved')
      }

      const applicationUser = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true },
      })
      if (!applicationUser) {
        const subscriptions = await this.currentSubscriptions(customerId)
        const isDeletedAccountCleanup =
          subscriptions.some(({ id }) => id === subscriptionId) &&
          subscriptions.every(({ status }) => terminalSubscriptionStatuses.has(status))
        if (isDeletedAccountCleanup) {
          this.logger.warn(
            `Acknowledging terminal Stripe event ${event.id} for deleted user ${userId}`,
          )
          return
        }
        throw new ServiceUnavailableException('Stripe subscription user no longer exists')
      }

      // Serialize Checkout and all subscriptions for this user, across API processes. Fetching
      // Stripe state AFTER taking this lock prevents an older in-flight snapshot overwriting a newer one.
      await this.lockUser(tx, userId)
      const account = await tx.billingAccount.upsert({
        where: { userId },
        create: { userId, stripeCustomerId: customerId },
        update: {},
      })
      if (account.stripeCustomerId && account.stripeCustomerId !== customerId) {
        throw new ServiceUnavailableException('Stripe customer does not match the billing account')
      }
      if (!account.stripeCustomerId) {
        await tx.billingAccount.update({
          where: { userId },
          data: { stripeCustomerId: customerId },
        })
      }

      const subscriptions = await this.currentSubscriptions(customerId)
      if (!subscriptions.some(({ id }) => id === subscriptionId)) {
        throw new ServiceUnavailableException(
          'Stripe subscription is missing from the current customer state',
        )
      }
      let proUntil: Date | null = null
      let hasPro = false
      for (const subscription of subscriptions) {
        const subscriptionCustomer =
          typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id
        if (
          subscriptionCustomer !== customerId ||
          (subscription.metadata?.userId && subscription.metadata.userId !== userId)
        ) {
          throw new ServiceUnavailableException('Stripe subscription ownership mismatch')
        }
        const stored = await tx.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        })
        if (stored && stored.userId !== userId) {
          throw new ServiceUnavailableException('Stored subscription ownership mismatch')
        }
        const priceId = subscription.items.data[0]?.price.id ?? null
        const plan = findPlanByPriceId(priceId, this.configService)
        if (grantsProAccess(subscription.status) && !plan) {
          throw new ServiceUnavailableException(
            `Active Stripe subscription uses an unconfigured Price ID: ${priceId ?? 'missing'}`,
          )
        }
        const periodEndSeconds = subscription.items.data[0]?.current_period_end
        const currentPeriodEnd = periodEndSeconds ? new Date(periodEndSeconds * 1000) : null
        const status = Object.values(SubscriptionStatus).find(
          (value) => value === subscription.status,
        )
        if (!status) throw new ServiceUnavailableException('Unsupported Stripe subscription status')
        const data = {
          stripeCustomerId: customerId,
          stripePriceId: priceId,
          status,
          currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        }
        await tx.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          create: { ...data, userId, stripeSubscriptionId: subscription.id },
          update: data,
        })
        if (grantsProAccess(subscription.status) && plan?.plan === 'pro') {
          hasPro = true
          if (currentPeriodEnd && (!proUntil || currentPeriodEnd > proUntil))
            proUntil = currentPeriodEnd
        }
      }
      // Historical canceled subscriptions must not revoke a different currently active subscription.
      await tx.user.updateMany({
        where: { id: userId, plan: { not: 'admin' } },
        data: { plan: hasPro ? 'pro' : 'free', proUntil: hasPro ? proUntil : null },
      })
    }, transactionOptions)
  }
}
