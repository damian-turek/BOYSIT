import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { QuestionsController } from './questions.controller'
import { QuestionsService } from './questions.service'

@Module({
  imports: [PrismaModule],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})

export class QuestionsModule {}
