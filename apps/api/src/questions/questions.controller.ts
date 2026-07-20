import { Controller, Get, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { GetQuestionsDto } from './dto/questions.dto'
import { QuestionsService } from './questions.service'
import { AuthGuard } from '../auth/auth.guard'

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  // @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getQuestions(@Query() query: GetQuestionsDto, @Req() req: any) {
    return this.questionsService.findAll(query)
  }
}