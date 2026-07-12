import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { QuestionsService } from './questions.service'
import { AuthGuard } from '../auth/auth.guard'
import { AddQuestionDto, GetQuestionDto } from './dto/questions.dto'

@Controller('api/questions')
@UseGuards(AuthGuard)
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findFilteredQuestions(@Query() query: GetQuestionDto) {
    return this.questionsService.findFilteredQuestions(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findSingle(id)
  }

  @Post()
  createOne(@Query() query: AddQuestionDto) {
    return this.questionsService.createQuestion(query)
  }
}
