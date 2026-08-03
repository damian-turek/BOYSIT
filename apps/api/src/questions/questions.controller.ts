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
import { GetQuestionsDto } from './dto/questions.dto'
import { QuestionsService } from './questions.service'

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getQuestions(@Query() query: GetQuestionsDto, @Req() req: any) {
    return this.questionsService.findAll(query)
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async getQuestionsSingle(@Param('id') id: string, @Req() req: any) {
    return this.questionsService.findSingle(id)
  }
}
