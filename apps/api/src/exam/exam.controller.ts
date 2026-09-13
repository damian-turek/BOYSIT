import { Body, Controller, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { StartExamDto } from './dto/start-exam.dto'
import { SubmitExamDto } from './dto/submit-exam.dto'
import { ExamService } from './exam.service'

@Controller('exam')
@UseGuards(AuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post('start')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  startExam(@Req() request: AuthenticatedRequest, @Body() dto: StartExamDto) {
    return this.examService.startExam(request.user.id, request.user.plan, dto.difficulty, dto.questionCount)
  }

  @Post('submit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  submitExam(@Req() request: AuthenticatedRequest, @Body() dto: SubmitExamDto) {
    return this.examService.submitExam(request.user.id, dto.difficulty, dto.answers, dto.durationSeconds)
  }
}
