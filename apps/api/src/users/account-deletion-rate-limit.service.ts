import { HttpException, HttpStatus, Injectable } from '@nestjs/common'

export const ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS = 60
export const ACCOUNT_DELETION_CODE_WINDOW_MINUTES = 15
export const ACCOUNT_DELETION_CODE_MAX_REQUESTS = 3

const cooldownMilliseconds = ACCOUNT_DELETION_CODE_COOLDOWN_SECONDS * 1_000
const windowMilliseconds = ACCOUNT_DELETION_CODE_WINDOW_MINUTES * 60 * 1_000

@Injectable()
export class AccountDeletionRateLimitService {
  private readonly requestsByUser = new Map<string, number[]>()

  consume(userId: string, now = Date.now()): void {
    const windowStartedAt = now - windowMilliseconds
    const requests = (this.requestsByUser.get(userId) ?? []).filter(
      (requestedAt) => requestedAt > windowStartedAt,
    )
    const lastRequest = requests.at(-1)

    if (lastRequest !== undefined && now - lastRequest < cooldownMilliseconds) {
      const retryAfterSeconds = Math.ceil((cooldownMilliseconds - (now - lastRequest)) / 1_000)
      this.throwRateLimit(retryAfterSeconds)
    }

    const firstRequest = requests[0]

    if (requests.length >= ACCOUNT_DELETION_CODE_MAX_REQUESTS && firstRequest !== undefined) {
      const retryAfterSeconds = Math.ceil((firstRequest + windowMilliseconds - now) / 1_000)
      this.throwRateLimit(retryAfterSeconds)
    }

    this.requestsByUser.set(userId, [...requests, now])
  }

  clear(userId: string): void {
    this.requestsByUser.delete(userId)
  }

  private throwRateLimit(retryAfterSeconds: number): never {
    throw new HttpException(
      {
        error: {
          code: 'ACCOUNT_DELETION_CODE_RATE_LIMITED',
          message: 'Too many account deletion code requests',
          retryAfterSeconds,
        },
      },
      HttpStatus.TOO_MANY_REQUESTS,
    )
  }
}
