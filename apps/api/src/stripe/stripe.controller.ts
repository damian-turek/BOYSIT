import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FastifyRequest } from 'fastify'
import Stripe from 'stripe'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { CreateCheckoutSessionDto } from './dto/checkout-session.dto'
import { StripeService } from './stripe.service'

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name)

  constructor(
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
  ) {}

  @Post('checkout-session')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async createCheckoutSession(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateCheckoutSessionDto,
  ): Promise<{ url: string | null; id: string }> {
    const session = await this.stripeService.createSubscriptionCheckout(request.user, dto)
    return { url: session.url, id: session.id }
  }

  // Stripe -> our backend. No AuthGuard here: Stripe is not our user, the
  // request is authenticated instead via the `stripe-signature` header.
  @Post('webhook')
  async handleWebhook(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log('Stripe webhook request received')

    if (!request.rawBody) {
      throw new BadRequestException('Missing raw body')
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header')
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')

    if (!webhookSecret) {
      throw new NotFoundException('Missing STRIPE_WEBHOOK_SECRET configuration')
    }

    let event: Stripe.Event

    try {
      event = this.stripeService.constructWebhookEvent(request.rawBody, signature, webhookSecret)
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${(err as Error).message}`)
      throw new BadRequestException(
        `Webhook signature verification failed: ${(err as Error).message}`,
      )
    }

    await this.stripeService.handleWebhookEvent(event)

    return { received: true }
  }
}
