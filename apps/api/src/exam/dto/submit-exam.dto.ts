import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Difficulty } from 'database/dist/generated/prisma/enums'

export class ExamAnswerDto {
  @IsUUID()
  questionId!: string

  @IsBoolean()
  knewIt!: boolean
}

export class SubmitExamDto {
  @IsEnum(Difficulty)
  difficulty!: Difficulty

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ExamAnswerDto)
  answers!: ExamAnswerDto[]

  @IsInt()
  @Min(0)
  durationSeconds!: number
}
