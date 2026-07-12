import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './user.service'

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UserModule {}