import { IsEnum } from 'class-validator'
import { Assessment } from 'database'

export class SubmitExamAssessmentDto {
  @IsEnum(Assessment)
  assessment!: Assessment
}
