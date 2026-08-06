import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'

import { SupabaseAdminService } from './supabase-admin.service'

describe('SupabaseAdminService', () => {
  it('accepts the current Supabase secret-key configuration', () => {
    const service = new SupabaseAdminService(
      new ConfigService({
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_SECRET_KEY: 'sb_secret_test-key',
      }),
    )

    expect(() => service.ensureConfigured()).not.toThrow()
  })

  it('keeps the API available and rejects deletion when admin credentials are missing', async () => {
    const service = new SupabaseAdminService(
      new ConfigService({
        SUPABASE_URL: 'https://example.supabase.co',
      }),
    )

    await expect(service.deleteUser('auth-user-id')).rejects.toMatchObject({
      status: 503,
      response: {
        error: {
          code: 'ACCOUNT_DELETION_NOT_CONFIGURED',
        },
      },
    })
  })
})
