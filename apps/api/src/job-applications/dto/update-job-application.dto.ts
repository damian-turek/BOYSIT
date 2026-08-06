import { Transform } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MaxLength,
} from 'class-validator'
import { JobApplicationStatus } from 'database'

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value

export class UpdateJobApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  @Transform(trimString)
  company?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  @Transform(trimString)
  role?: string

  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(trimString)
  location?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trimString)
  salary?: string | null

  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  @Transform(trimString)
  jobUrl?: string | null

  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  @Transform(trimString)
  note?: string | null

  @IsOptional()
  @IsISO8601({ strict: true })
  appliedAt?: string | null

  @IsOptional()
  @IsISO8601({ strict: true })
  followUpAt?: string | null

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  technologyIds?: string[]

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  customTechnologies?: string[]
}
