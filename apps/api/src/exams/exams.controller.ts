import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { StartExamSessionDto } from './dto/start-exam-session.dto'
import { SubmitExamAssessmentDto } from './dto/submit-exam-assessment.dto'
import { ExamsService } from './exams.service'

const examValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
})

@Controller('exams')
@UseGuards(AuthGuard)
@UsePipes(examValidationPipe)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  getCatalog(@Req() request: AuthenticatedRequest) {
    return this.examsService.getCatalog(request.user)
  }

  @Post(':slug/sessions')
  startSession(
    @Req() request: AuthenticatedRequest,
    @Param('slug') slug: string,
    @Body() input: StartExamSessionDto,
  ) {
    return this.examsService.startSession(request.user, slug, input)
  }
}

@Controller('exam-sessions')
@UseGuards(AuthGuard)
@UsePipes(examValidationPipe)
export class ExamSessionsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get(':sessionId')
  getSession(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
  ) {
    return this.examsService.getSession(request.user, sessionId)
  }

  @Post(':sessionId/questions/:questionId/assessment')
  submitAssessment(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
    @Param('questionId', new ParseUUIDPipe({ version: '4' })) questionId: string,
    @Body() input: SubmitExamAssessmentDto,
  ) {
    return this.examsService.submitAssessment(request.user, sessionId, questionId, input)
  }

  @Post(':sessionId/complete')
  completeReview(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
  ) {
    return this.examsService.completeReview(request.user, sessionId)
  }

  @Get(':sessionId/result')
  getResult(
    @Req() request: AuthenticatedRequest,
    @Param('sessionId', new ParseUUIDPipe({ version: '4' })) sessionId: string,
  ) {
    return this.examsService.getResult(request.user, sessionId)
  }
}
