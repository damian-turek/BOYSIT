import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'
import { JobApplicationStatus } from 'database'

export enum JobApplicationSort {
  updatedDesc = 'updated_desc',
  appliedDesc = 'applied_desc',
  followUpAsc = 'follow_up_asc',
  companyAsc = 'company_asc',
}

export class ListJobApplicationsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string

  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus

  @IsOptional()
  @IsEnum(JobApplicationSort)
  sort: JobApplicationSort = JobApplicationSort.updatedDesc

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  page = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number.parseInt(value, 10))
  limit = 12
}

export class ListStatusEventsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  page = 1

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => Number.parseInt(value, 10))
  limit = 20
}
