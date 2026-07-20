import { Injectable } from '@nestjs/common'

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
  formatUserProfile(user: any): UserProfileResponse {
    if (!user) {
      throw new Error('User data is missing')
    }

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
}