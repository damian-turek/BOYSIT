import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

import { env } from '../config/env.js'
import { usersService } from '../modules/users/users.service.js'
import type { SupabaseUserClaims } from '../modules/users/users.types.js'

type SupabaseJwtPayload = JwtPayload &
  SupabaseUserClaims & {
    aud?: string
    role?: string
  }

const authPluginCallback: FastifyPluginAsync = async (app) => {
  app.decorateRequest('currentUser', null)

  app.addHook('onRequest', async (request) => {
    request.currentUser = null

    const authorization = request.headers.authorization

    if (!authorization?.startsWith('Bearer ')) {
      return
    }

    const token = authorization.slice('Bearer '.length).trim()

    if (!token) {
      throw app.httpErrors.unauthorized('Missing bearer token')
    }

    let decoded: SupabaseJwtPayload

    try {
      decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET, {
        algorithms: ['HS256'],
      }) as SupabaseJwtPayload
    } catch {
      throw app.httpErrors.unauthorized('Invalid auth token')
    }

    if (!decoded.sub || !decoded.email) {
      throw app.httpErrors.unauthorized('Invalid auth token')
    }

    const name =
      decoded.user_metadata?.full_name ?? decoded.user_metadata?.name ?? null

    request.currentUser = await usersService.syncFromSupabase({
      authProviderId: decoded.sub,
      email: decoded.email,
      name,
    })
  })
}

export const authPlugin = fp(authPluginCallback, {
  name: 'auth-plugin',
})
