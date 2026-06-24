import { prisma } from 'database'

import type { CurrentUser } from './users.types.js'

const selectCurrentUser = {
  id: true,
  email: true,
  name: true,
  plan: true,
  proUntil: true,
  createdAt: true,
  updatedAt: true,
} as const

const toCurrentUser = (user: {
  id: string
  email: string
  name: string | null
  plan: CurrentUser['plan']
  proUntil: Date | null
  createdAt: Date
  updatedAt: Date
}): CurrentUser => user

export const usersRepository = {
  async syncFromSupabase(input: {
    authProviderId: string
    email: string
    name: string | null
  }) {
    const user = await prisma.user.upsert({
      where: {
        authProviderId: input.authProviderId,
      },
      create: {
        authProviderId: input.authProviderId,
        email: input.email,
        name: input.name,
      },
      update: {
        email: input.email,
        name: input.name,
      },
      select: selectCurrentUser,
    })

    return toCurrentUser(user)
  },

  async updateName(userId: string, name: string | null) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
      },
      select: selectCurrentUser,
    })

    return toCurrentUser(user)
  },
}
