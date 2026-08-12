import { Module } from '@nestjs/common'

import { PrismaModule } from '../prisma/prisma.module'
import { ExamSessionsController, ExamsController } from './exams.controller'
import { ExamsService } from './exams.service'

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController, ExamSessionsController],
  providers: [ExamsService],
})
export class ExamsModule {}
