import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { createServerClient, parseCookieHeader, type CookieMethodsServer } from '@supabase/ssr'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const supabase = this.createSupabaseClient(request)

    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser()

    if (error || !supabaseUser) {
      throw new UnauthorizedException(error?.message || 'Invalid or missing session')
    }

    const dbUser = await this.ensureDbUser(supabaseUser)

    request['user'] = dbUser

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

  /**
   * Zwraca istniejącego usera z bazy powiązanego z Supabase Auth,
   * a jeśli nie istnieje - tworzy go (lazy sync, bo nie ma webhooków Supabase).
   */
  private async ensureDbUser(supabaseUser: {
    id: string
    email?: string
    user_metadata?: Record<string, any>
  }) {
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
      // Race condition: inny równoległy request już utworzył tego usera.
      const createdConcurrently = await this.prismaService.client.user.findUnique({
        where: { authProviderId: supabaseUser.id },
      })
      if (createdConcurrently) return createdConcurrently

      // Email już istnieje w bazie (np. konto stworzone wcześniej bez auth_provider_id) - dowiąż je.
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

  private createSupabaseClient(request: any) {
    const rawCookieHeader: string = request.headers?.cookie || request.raw?.headers?.cookie || ''

    const parsedCookies: { name: string; value: string }[] = rawCookieHeader
      ? parseCookieHeader(rawCookieHeader).filter(
        (cookie): cookie is { name: string; value: string } => typeof cookie.value === 'string',
      )
      : []

    const bearerToken = this.extractBearerToken(request)

    const cookieMethods: CookieMethodsServer = {
      getAll: () => parsedCookies,
      setAll: () => {},
    }

    const supabase = createServerClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
      { cookies: cookieMethods },
    )

    if (bearerToken) {
      return {
        auth: {
          getUser: () => supabase.auth.getUser(bearerToken),
        },
      } as ReturnType<typeof createServerClient>
    }

    return supabase
  }

  private extractBearerToken(request: any): string | undefined {
    const headers = request.headers || request.raw?.headers
    const authHeader = headers?.authorization

    if (!authHeader || typeof authHeader !== 'string') return undefined

    const cleanHeader = authHeader.trim()
    if (cleanHeader.toLowerCase().startsWith('bearer ')) {
      return cleanHeader.split(/\s+/)[1]
    }

    return undefined
  }
}