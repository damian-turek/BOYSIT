import type { User } from 'database'
import type { FastifyRequest } from 'fastify'

export interface AuthenticatingRequest extends FastifyRequest {
  user?: User
}

export interface AuthenticatedRequest extends AuthenticatingRequest {
  user: User
}
