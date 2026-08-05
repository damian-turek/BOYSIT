import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { DeleteAccountDto } from './dto/delete-account.dto'
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

  @Post('deletion-code')
  requestAccountDeletionCode(@Req() request: AuthenticatedRequest) {
    return this.userService.requestAccountDeletionCode(request.user)
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  deleteAccount(@Req() request: AuthenticatedRequest, @Body() body: DeleteAccountDto) {
    return this.userService.deleteAccount(request.user, body.code)
  }
}
