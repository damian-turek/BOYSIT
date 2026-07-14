import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module'
import { QuestionsModule } from './questions/questions.module'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from './users/user.module'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, QuestionsModule, UserModule],
  controllers: [],
  providers: [],
})

export class AppModule {}