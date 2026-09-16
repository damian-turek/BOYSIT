import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'

import { AuthGuard } from '../auth/auth.guard'
import type { AuthenticatedRequest } from '../auth/authenticated-request'
import { GetQuestionsDto } from './dto/questions.dto'
import { QuestionsService } from './questions.service'

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getQuestions(@Query() query: GetQuestionsDto, @Req() req: AuthenticatedRequest) {
    return this.questionsService.findAll(query, req.user.plan)
  }

  // NOTE: these two MUST stay above the `:id` route below - Nest/Express
  // matches routes in registration order, so if `:id` came first it would
  // swallow `/questions/categories` and `/questions/technologies` requests,
  // treating "categories"/"technologies" as a question id.
  @Get('categories')
  @UseGuards(AuthGuard)
  getCategories() {
    return this.questionsService.findCategories()
  }

  @Get('technologies')
  @UseGuards(AuthGuard)
  getTechnologies() {
    return this.questionsService.findTechnologies()
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getQuestionsSingle(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.questionsService.findSingle(id, req.user.plan, req.user.id)
  }
}
