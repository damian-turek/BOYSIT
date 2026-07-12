import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Reflector } from '@nestjs/core'

@Injectable()
export class AuthGuard implements CanActivate {
  private supabase: SupabaseClient

  constructor(
    private readonly prismaService: PrismaService,
    private readonly reflector: Reflector,
  ) {
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    )
  }

  async canActivate(context:ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = this.extractTokenFromHeader(request)

    if (!token) throw new UnauthorizedException('Token not found')

    const { data: {user: supabaseUser}, error } = await this.supabase.auth.getUser(token)

    if (error || !supabaseUser) throw new UnauthorizedException(error)

    const dbUser = await this.prismaService.client.user.findUnique({
      where: {
        authProviderId: supabaseUser.id,
      },
    })

    if (!dbUser) {
      if (request.url === '/api/me' || request.path === '/api/me') {
        request['user'] = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          user_metadata: supabaseUser.user_metadata,
          plan: 'free', // Nowy użytkownik domyślnie dostaje plan free
        }
        return true
      }
      throw new UnauthorizedException('User registration in progress')
    }

    request['user'] = dbUser

    const requiredPlans = this.reflector.getAllAndOverride('plans', [context.getHandler(), context.getClass()])

    if (!requiredPlans) return true

    const hasPlan = requiredPlans.includes(dbUser.plan)

    if (!hasPlan) throw new UnauthorizedException('Access denied')

    return true
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization || request.raw?.headers?.authorization

    if (!authHeader || typeof authHeader !== 'string') {
      return undefined
    }

    const cleanHeader = authHeader.trim()

    if (cleanHeader.startsWith('Bearer ')) {
      return cleanHeader.split(/\s+/)[1]
    }

    return undefined
  }
}