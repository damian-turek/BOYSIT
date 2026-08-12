import { IsString, MaxLength } from 'class-validator'

export const EXAM_ANSWER_MAX_LENGTH = 10_000

export class SaveExamAnswerDto {
  @IsString()
  @MaxLength(EXAM_ANSWER_MAX_LENGTH)
  userAnswer!: string
}
