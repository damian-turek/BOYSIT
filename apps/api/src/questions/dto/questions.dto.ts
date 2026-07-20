import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator'
import { AccessLevel, Difficulty, QuestionType } from 'database/dist/generated/prisma/enums'
import { Transform } from 'class-transformer'

export class GetQuestionsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  technologies?: string[];

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  // Paginacja z domyślnymi wartościami
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}
