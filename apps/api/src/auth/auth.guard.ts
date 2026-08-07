import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { type CookieMethodsServer, createServerClient, parseCookieHeader } from '@supabase/ssr'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { FastifyRequest } from 'fastify'

import { PrismaService } from '../prisma/prisma.service'
import type { AuthenticatingRequest } from './authenticated-request'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatingRequest>()
    const supabase = this.createSupabaseClient(request)
    const bearerToken = this.extractBearerToken(request)

    const {
      data: { user: supabaseUser },
      error,
    } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser()

    if (error || !supabaseUser) {
      throw new UnauthorizedException(error?.message || 'Invalid or missing session')
    }

    const dbUser = await this.ensureDbUser(supabaseUser)

    request.user = dbUser

    const requiredPlans = this.reflector.getAllAndOverride<string[]>('plans', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredPlans) return true

    if (!requiredPlans.includes(dbUser.plan)) {
      throw new UnauthorizedException('Access denied')
    }

    return true
  }

  // Synchronize on demand because Supabase Auth webhooks are not configured.
  private async ensureDbUser(supabaseUser: Pick<SupabaseUser, 'id' | 'email' | 'user_metadata'>) {
    const existing = await this.prismaService.client.user.findUnique({
      where: { authProviderId: supabaseUser.id },
    })

    if (existing) return existing

    if (!supabaseUser.email) {
      throw new UnauthorizedException('Supabase user has no email, cannot sync account')
    }

    const name =
      typeof supabaseUser.user_metadata?.name === 'string' ? supabaseUser.user_metadata.name : null

    try {
      return await this.prismaService.client.user.create({
        data: {
          authProviderId: supabaseUser.id,
          email: supabaseUser.email,
          name,
        },
      })
    } catch {
      // Another concurrent first request may have created the user already.
      const createdConcurrently = await this.prismaService.client.user.findUnique({
        where: { authProviderId: supabaseUser.id },
      })
      if (createdConcurrently) return createdConcurrently

      // Link a legacy email-only database row to its Supabase identity.
      const byEmail = await this.prismaService.client.user.findUnique({
        where: { email: supabaseUser.email },
      })
      if (byEmail && !byEmail.authProviderId) {
        return this.prismaService.client.user.update({
          where: { id: byEmail.id },
          data: { authProviderId: supabaseUser.id },
        })
      }

      throw new UnauthorizedException('Failed to sync user account')
    }
  }

  private createSupabaseClient(request: FastifyRequest) {
    const rawCookieHeader = request.headers.cookie ?? request.raw.headers.cookie ?? ''

    const parsedCookies: { name: string; value: string }[] = rawCookieHeader
      ? parseCookieHeader(rawCookieHeader).filter(
          (cookie): cookie is { name: string; value: string } => typeof cookie.value === 'string',
        )
      : []

    const cookieMethods: CookieMethodsServer = {
      getAll: () => parsedCookies,
      setAll: () => {},
    }

    return createServerClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
      cookies: cookieMethods,
    })
  }

  private extractBearerToken(request: FastifyRequest): string | undefined {
    const authHeader = request.headers.authorization ?? request.raw.headers.authorization

    if (!authHeader || typeof authHeader !== 'string') return undefined

    const cleanHeader = authHeader.trim()
    if (cleanHeader.toLowerCase().startsWith('bearer ')) {
      return cleanHeader.split(/\s+/)[1]
    }

    return undefined
  }
}
