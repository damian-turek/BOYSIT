import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { type SupabaseClient, createClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseAdminService {
  private readonly logger = new Logger(SupabaseAdminService.name)
  private readonly client: SupabaseClient | null

  constructor(configService: ConfigService) {
    const supabaseUrl = configService.get<string>('SUPABASE_URL')?.trim()
    const secretKey =
      configService.get<string>('SUPABASE_SECRET_KEY')?.trim() ||
      configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')?.trim()

    if (!supabaseUrl || !secretKey) {
      this.client = null
      this.logger.warn(
        'Account deletion is disabled: SUPABASE_URL and SUPABASE_SECRET_KEY are required',
      )
      return
    }

    this.client = createClient(supabaseUrl, secretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  }

  ensureConfigured(): void {
    this.getClient()
  }

  async deleteUser(authUserId: string): Promise<void> {
    const client = this.getClient()
    const { error } = await client.auth.admin.deleteUser(authUserId, false)

    if (error) {
      throw new ServiceUnavailableException({
        error: {
          code: 'AUTH_ACCOUNT_DELETION_FAILED',
          message: 'The authentication account could not be deleted',
        },
      })
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new ServiceUnavailableException({
        error: {
          code: 'ACCOUNT_DELETION_NOT_CONFIGURED',
          message: 'Account deletion is not configured on the server',
        },
      })
    }

    return this.client
  }
}
