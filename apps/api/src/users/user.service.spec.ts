import type { User } from 'database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
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
  const prismaService = {
    client: {
      user: {
        update,
      },
    },
  } as unknown as PrismaService

  let service: UsersService

  beforeEach(() => {
    update.mockReset()
    service = new UsersService(prismaService)
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
})
