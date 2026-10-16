import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Stripe from 'stripe'

import { STRIPE_CLIENT } from './stripe.constants'
import { StripeController } from './stripe.controller'
import { StripeService } from './stripe.service'

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('STRIPE_SECRET_KEY')

        if (!apiKey) throw new Error('Missing STRIPE_SECRET_KEY environment variable')

        return new Stripe(apiKey, {
          apiVersion: '2026-07-29.dahlia',
        })
      },
    },
    StripeService,
  ],
  exports: [StripeService],
})
export class StripeModule {}
