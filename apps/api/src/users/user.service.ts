import { Injectable } from '@nestjs/common'
import type { User } from 'database'

import { PrismaService } from '../prisma/prisma.service'

export interface UserProfileResponse {
  data: {
    id: string
    email: string
    name: string | null
    plan: 'free' | 'pro' | 'admin'
    proUntil: string | null
  }
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

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
}
