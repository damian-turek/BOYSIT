import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseEmailOtpService {
  private readonly logger = new Logger(SupabaseEmailOtpService.name)
  private readonly client: SupabaseClient | null

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL')?.trim()
    const anonKey = configService.get<string>('SUPABASE_ANON_KEY')?.trim()

    if (!supabaseUrl || !anonKey) {
      this.client = null
      this.logger.warn(
        'Account deletion email verification is disabled: SUPABASE_URL and SUPABASE_ANON_KEY are required',
      )
      return
    }

    this.client = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  }

  async sendAccountDeletionCode(email: string): Promise<void> {
    const client = this.getClient()
    const { error } = await client.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    if (!error) return

    if (error.status === HttpStatus.TOO_MANY_REQUESTS) {
      throw new HttpException(
        {
          error: {
            code: 'ACCOUNT_DELETION_EMAIL_RATE_LIMITED',
            message: 'Supabase temporarily rate-limited account deletion emails',
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    throw new ServiceUnavailableException({
      error: {
        code: 'ACCOUNT_DELETION_EMAIL_FAILED',
        message: 'The account deletion code could not be sent',
      },
    })
  }

  async verifyAccountDeletionCode(
    email: string,
    code: string,
    expectedAuthUserId: string,
  ): Promise<void> {
    const client = this.getClient()
    const { data, error } = await client.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error || data.user?.id !== expectedAuthUserId) {
      throw new BadRequestException({
        error: {
          code: 'INVALID_ACCOUNT_DELETION_CODE',
          message: 'The account deletion code is invalid or expired',
        },
      })
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new ServiceUnavailableException({
        error: {
          code: 'ACCOUNT_DELETION_EMAIL_NOT_CONFIGURED',
          message: 'Account deletion email verification is not configured on the server',
        },
      })
    }

    return this.client
  }
}
