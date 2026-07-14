import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { AuthGuard } from '../auth/auth.guard'
import { UsersService } from './user.service'

interface AuthenticatedRequest extends FastifyRequest {
  user: SupabaseUser
}

@Controller('api/me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    const supabaseUser = request.user

    return this.userService.formatUserProfile(supabaseUser)
  }
}