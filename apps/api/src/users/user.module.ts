import { Module } from '@nestjs/common'

import { SupabaseAdminService } from '../auth/supabase-admin.service'
import { SupabaseEmailOtpService } from '../auth/supabase-email-otp.service'
import { StripeModule } from '../stripe/stripe.module'
import { AccountDeletionRateLimitService } from './account-deletion-rate-limit.service'
import { UsersService } from './user.service'
import { UsersController } from './users.controller'

@Module({
  imports: [StripeModule],
  providers: [
    UsersService,
    SupabaseAdminService,
    SupabaseEmailOtpService,
    AccountDeletionRateLimitService,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UserModule {}
