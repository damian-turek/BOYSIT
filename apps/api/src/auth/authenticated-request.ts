import type { User } from 'database'
import type { FastifyRequest } from 'fastify'

export interface AuthenticatedRequest extends FastifyRequest {
  user: User
}
