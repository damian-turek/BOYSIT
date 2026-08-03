import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UsersService } from './user.service'

@Controller('me')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  getProfile(@Req() request: AuthenticatedRequest) {
    return this.userService.formatUserProfile(request.user)
  }

  @Patch()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  updateProfile(@Req() request: AuthenticatedRequest, @Body() profile: UpdateProfileDto) {
    return this.userService.updateProfile(request.user.id, profile.name)
  }
}
