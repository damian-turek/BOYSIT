import type { CurrentUser } from './users.types.js'
import { usersRepository } from './users.repository.js'

export const usersService = {
  syncFromSupabase(input: {
    authProviderId: string
    email: string
    name: string | null
  }): Promise<CurrentUser> {
    return usersRepository.syncFromSupabase(input)
  },

  updateName(userId: string, name: string | null): Promise<CurrentUser> {
    return usersRepository.updateName(userId, name)
  },
}
