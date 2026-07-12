import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { AccessLevel, Difficulty, QuestionType } from 'database/dist/generated/prisma/enums'
import { Type } from 'class-transformer'

export class GetQuestionDto {
  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty

  @IsOptional()
  @IsString()
  technology?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number
}

export class AddQuestionDto {
  @IsString()
  title!: string

  @IsString()
  slug!: string

  @IsOptional()
  @IsString()
  excerpt?: string

  @IsString()
  questionText!: string

  @IsOptional()
  @IsString()
  answerText?: string

  @IsOptional()
  @IsString()
  explanation?: string

  @IsOptional()
  @IsString()
  codeSnippet?: string

  @IsEnum(Difficulty)
  difficulty!: Difficulty

  @IsEnum(QuestionType)
  questionType!: QuestionType

  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  verified?: boolean

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  technologyId?: string
}