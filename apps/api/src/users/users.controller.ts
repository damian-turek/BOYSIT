import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { AuthGuard } from '../auth/auth.guard'
import { UsersService } from './user.service'

interface AuthenticatedRequest extends FastifyRequest {
  user: any
}

@Controller('me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    const user = request.user

    return this.userService.formatUserProfile(user)
  }
}