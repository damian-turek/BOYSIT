import type { CurrentUser } from '../modules/users/users.types.js'

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: CurrentUser | null
  }
}

export {}
