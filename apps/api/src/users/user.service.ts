import { Injectable } from '@nestjs/common'
import { User } from '@supabase/supabase-js'

export interface UserProfileResponse {
  data: {
    id: string
    email: string | undefined
    name: string | null
    plan: 'free' | 'pro' | 'admin'
    proUntil: string | null
  }
}

@Injectable()
export class UsersService {

  formatUserProfile(supabaseUser: User): UserProfileResponse {
    const metadata = supabaseUser.user_metadata || {}

    return {
      data: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: typeof metadata.name === 'string' ? metadata.name : null,
        plan: (metadata.plan === 'pro' || metadata.plan === 'admin') ? metadata.plan : 'free',
        proUntil: typeof metadata.proUntil === 'string' ? metadata.proUntil : null,
      },
    }
  }
}