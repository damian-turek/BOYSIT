import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator'
import { Difficulty } from 'database/dist/generated/prisma/enums'

export class StartExamDto {
  @IsEnum(Difficulty)
  difficulty!: Difficulty

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(25)
  questionCount?: number = 10
}
