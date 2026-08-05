import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS,
  ACCOUNT_DELETION_CODE_MAX_REQUESTS,
  ACCOUNT_DELETION_CODE_WINDOW_MINUTES,
  AccountDeletionRateLimitService,
} from './account-deletion-rate-limit.service'

const seconds = (value: number) => value * 1_000

describe('AccountDeletionRateLimitService', () => {
  it('enforces the cooldown between deletion-code emails', () => {
    const service = new AccountDeletionRateLimitService()

    service.consume('user-id', 0)

    expect(() => service.consume('user-id', seconds(30))).toThrowError(
      expect.objectContaining({
        status: 429,
        response: expect.objectContaining({
          error: expect.objectContaining({
            code: 'ACCOUNT_DELETION_CODE_RATE_LIMITED',
            retryAfterSeconds: 30,
          }),
        }),
      }),
    )
  })

  it('allows only three sends in a fifteen-minute window', () => {
    const service = new AccountDeletionRateLimitService()

    for (let request = 0; request < ACCOUNT_DELETION_CODE_MAX_REQUESTS; request += 1) {
      service.consume('user-id', seconds(request * ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS))
    }

    expect(() =>
      service.consume(
        'user-id',
        seconds(ACCOUNT_DELETION_CODE_MAX_REQUESTS * ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS),
      ),
    ).toThrowError(
      expect.objectContaining({
        status: 429,
        response: expect.objectContaining({
          error: expect.objectContaining({
            code: 'ACCOUNT_DELETION_CODE_RATE_LIMITED',
            retryAfterSeconds:
              ACCOUNT_DELETION_CODE_WINDOW_MINUTES * 60 -
              ACCOUNT_DELETION_CODE_MAX_REQUESTS * ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS,
          }),
        }),
      }),
    )
  })

  it('clears the limiter after account deletion', () => {
    const service = new AccountDeletionRateLimitService()

    service.consume('user-id', 0)
    service.clear('user-id')

    expect(() => service.consume('user-id', seconds(1))).not.toThrow()
  })
})
