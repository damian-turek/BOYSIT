import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'

import { SupabaseEmailOtpService } from './supabase-email-otp.service'

describe('SupabaseEmailOtpService', () => {
  it('rejects email verification operations when public Auth configuration is missing', async () => {
    const service = new SupabaseEmailOtpService(new ConfigService())

    await expect(service.sendAccountDeletionCode('ada@example.com')).rejects.toMatchObject({
      status: 503,
      response: {
        error: {
          code: 'ACCOUNT_DELETION_EMAIL_NOT_CONFIGURED',
        },
      },
    })
  })
})
