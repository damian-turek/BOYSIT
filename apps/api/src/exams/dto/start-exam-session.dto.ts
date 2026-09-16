import { IsInt, IsOptional, Max, Min } from 'class-validator'

export class StartExamSessionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  questionCount?: number
}
