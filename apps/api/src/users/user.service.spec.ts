import type { User } from 'database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { SupabaseAdminService } from '../auth/supabase-admin.service'
import type { SupabaseEmailOtpService } from '../auth/supabase-email-otp.service'
import type { PrismaService } from '../prisma/prisma.service'
import type { StripeService } from '../stripe/stripe.service'
import type { AccountDeletionRateLimitService } from './account-deletion-rate-limit.service'
import { UsersService } from './user.service'

const user: User = {
  id: '5bf4e958-1555-40cd-a8de-f8f6641ab4f1',
  email: 'ada@example.com',
  name: 'Ada Lovelace',
  authProviderId: 'auth-user-id',
  plan: 'free',
  proUntil: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('UsersService', () => {
  const update = vi.fn()
  const deleteUserRecord = vi.fn()
  const deleteAuthUser = vi.fn()
  const ensureAdminConfigured = vi.fn()
  const sendAccountDeletionCode = vi.fn()
  const verifyAccountDeletionCode = vi.fn()
  const consumeDeletionCodeRequest = vi.fn()
  const clearDeletionCodeRequests = vi.fn()
  const cancelSubscriptionsForAccountDeletion = vi.fn()
  const prismaService = {
    client: {
      user: {
        update,
        delete: deleteUserRecord,
      },
    },
  } as unknown as PrismaService
  const supabaseAdminService = {
    deleteUser: deleteAuthUser,
    ensureConfigured: ensureAdminConfigured,
  } as unknown as SupabaseAdminService
  const supabaseEmailOtpService = {
    sendAccountDeletionCode,
    verifyAccountDeletionCode,
  } as unknown as SupabaseEmailOtpService
  const accountDeletionRateLimitService = {
    consume: consumeDeletionCodeRequest,
    clear: clearDeletionCodeRequests,
  } as unknown as AccountDeletionRateLimitService
  const stripeService = {
    cancelSubscriptionsForAccountDeletion,
  } as unknown as StripeService

  let service: UsersService

  beforeEach(() => {
    update.mockReset()
    deleteUserRecord.mockReset()
    deleteAuthUser.mockReset()
    ensureAdminConfigured.mockReset()
    sendAccountDeletionCode.mockReset()
    verifyAccountDeletionCode.mockReset()
    consumeDeletionCodeRequest.mockReset()
    clearDeletionCodeRequests.mockReset()
    cancelSubscriptionsForAccountDeletion.mockReset()
    service = new UsersService(
      prismaService,
      supabaseAdminService,
      supabaseEmailOtpService,
      accountDeletionRateLimitService,
      stripeService,
    )
  })

  it('updates only the authenticated user and returns the public profile', async () => {
    update.mockResolvedValue({ ...user, name: 'Grace Hopper' })

    await expect(service.updateProfile(user.id, 'Grace Hopper')).resolves.toEqual({
      data: {
        id: user.id,
        email: user.email,
        name: 'Grace Hopper',
        plan: 'free',
        proUntil: null,
      },
    })
    expect(update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { name: 'Grace Hopper' },
    })
  })

  it('serializes the Pro expiration date', () => {
    const proUntil = new Date('2026-08-31T12:00:00.000Z')

    expect(
      service.formatUserProfile({
        ...user,
        plan: 'pro',
        proUntil,
      }),
    ).toEqual({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: 'pro',
        proUntil: proUntil.toISOString(),
      },
    })
  })

  it('rate-limits and sends an account deletion code to the authenticated user email', async () => {
    sendAccountDeletionCode.mockResolvedValue(undefined)

    await expect(service.requestAccountDeletionCode(user)).resolves.toEqual({
      data: {
        resendAfterSeconds: 60,
      },
    })

    expect(ensureAdminConfigured).toHaveBeenCalledOnce()
    expect(consumeDeletionCodeRequest).toHaveBeenCalledWith(user.id)
    expect(sendAccountDeletionCode).toHaveBeenCalledWith(user.email)
  })

  it('verifies the email code before deleting both user records', async () => {
    verifyAccountDeletionCode.mockResolvedValue(undefined)
    deleteAuthUser.mockResolvedValue(undefined)
    deleteUserRecord.mockResolvedValue(user)

    await expect(service.deleteAccount(user, '12345678')).resolves.toBeUndefined()

    expect(ensureAdminConfigured).toHaveBeenCalledOnce()
    expect(verifyAccountDeletionCode).toHaveBeenCalledWith(
      user.email,
      '12345678',
      user.authProviderId,
    )
    expect(deleteAuthUser).toHaveBeenCalledWith(user.authProviderId)
    expect(cancelSubscriptionsForAccountDeletion).toHaveBeenCalledWith(user)
    expect(deleteUserRecord).toHaveBeenCalledWith({
      where: { id: user.id },
    })
    expect(clearDeletionCodeRequests).toHaveBeenCalledWith(user.id)
    expect(verifyAccountDeletionCode.mock.invocationCallOrder[0]).toBeLessThan(
      cancelSubscriptionsForAccountDeletion.mock.invocationCallOrder[0],
    )
    expect(cancelSubscriptionsForAccountDeletion.mock.invocationCallOrder[0]).toBeLessThan(
      deleteAuthUser.mock.invocationCallOrder[0],
    )
    expect(deleteAuthUser.mock.invocationCallOrder[0]).toBeLessThan(
      deleteUserRecord.mock.invocationCallOrder[0],
    )
  })

  it('does not delete user records when Stripe cancellation fails', async () => {
    verifyAccountDeletionCode.mockResolvedValue(undefined)
    cancelSubscriptionsForAccountDeletion.mockRejectedValue(new Error('Stripe is unavailable'))

    await expect(service.deleteAccount(user, '12345678')).rejects.toThrow('Stripe is unavailable')
    expect(deleteAuthUser).not.toHaveBeenCalled()
    expect(deleteUserRecord).not.toHaveBeenCalled()
  })

  it('does not delete application data when Supabase rejects account deletion', async () => {
    verifyAccountDeletionCode.mockResolvedValue(undefined)
    deleteAuthUser.mockRejectedValue(new Error('Supabase is unavailable'))

    await expect(service.deleteAccount(user, '12345678')).rejects.toThrow('Supabase is unavailable')
    expect(deleteUserRecord).not.toHaveBeenCalled()
  })

  it('does not delete either user record when the email code is invalid', async () => {
    verifyAccountDeletionCode.mockRejectedValue(
      Object.assign(new Error('Invalid account deletion code'), {
        status: 400,
      }),
    )

    await expect(service.deleteAccount(user, '00000000')).rejects.toMatchObject({
      status: 400,
    })
    expect(deleteAuthUser).not.toHaveBeenCalled()
    expect(deleteUserRecord).not.toHaveBeenCalled()
  })
})
