import type { UserPlan } from 'database'

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  plan: UserPlan
  proUntil: Date | null
  createdAt: Date
  updatedAt: Date
}

export type SupabaseUserClaims = {
  sub?: string
  email?: string
  user_metadata?: {
    full_name?: string
    name?: string
  }
}
