import { Injectable, InternalServerErrorException } from '@nestjs/common'
import type { User } from 'database'

import { SupabaseAdminService } from '../auth/supabase-admin.service'
import { SupabaseEmailOtpService } from '../auth/supabase-email-otp.service'
import { PrismaService } from '../prisma/prisma.service'
import {
  ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS,
  AccountDeletionRateLimitService,
} from './account-deletion-rate-limit.service'

export interface UserProfileResponse {
  data: {
    id: string
    email: string
    name: string | null
    plan: 'free' | 'pro' | 'admin'
    proUntil: string | null
  }
}

export interface AccountDeletionCodeResponse {
  data: {
    resendAfterSeconds: number
  }
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly supabaseAdminService: SupabaseAdminService,
    private readonly supabaseEmailOtpService: SupabaseEmailOtpService,
    private readonly accountDeletionRateLimitService: AccountDeletionRateLimitService,
  ) {}

  formatUserProfile(user: User): UserProfileResponse {
    return {
      data: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        plan: user.plan === 'pro' || user.plan === 'admin' ? user.plan : 'free',
        proUntil: user.proUntil ? new Date(user.proUntil).toISOString() : null,
      },
    }
  }

  async updateProfile(userId: string, name: string): Promise<UserProfileResponse> {
    const user = await this.prismaService.client.user.update({
      where: { id: userId },
      data: { name },
    })

    return this.formatUserProfile(user)
  }

  async requestAccountDeletionCode(user: User): Promise<AccountDeletionCodeResponse> {
    this.supabaseAdminService.ensureConfigured()
    this.accountDeletionRateLimitService.consume(user.id)
    await this.supabaseEmailOtpService.sendAccountDeletionCode(user.email)

    return {
      data: {
        resendAfterSeconds: ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS,
      },
    }
  }

  async deleteAccount(user: User, code: string): Promise<void> {
    if (!user.authProviderId) {
      throw new InternalServerErrorException({
        error: {
          code: 'AUTH_ACCOUNT_NOT_LINKED',
          message: 'The application account is not linked to an authentication account',
        },
      })
    }

    this.supabaseAdminService.ensureConfigured()
    await this.supabaseEmailOtpService.verifyAccountDeletionCode(
      user.email,
      code,
      user.authProviderId,
    )
    await this.supabaseAdminService.deleteUser(user.authProviderId)
    await this.prismaService.client.user.delete({
      where: { id: user.id },
    })
    this.accountDeletionRateLimitService.clear(user.id)
  }
}
