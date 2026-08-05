import { Transform } from 'class-transformer'
import { IsString, Length, Matches } from 'class-validator'

export const ACCOUNT_DELETION_CODE_MIN_LENGTH = 6
export const ACCOUNT_DELETION_CODE_MAX_LENGTH = 10

export class DeleteAccountDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\s/gu, '') : value))
  @IsString()
  @Length(ACCOUNT_DELETION_CODE_MIN_LENGTH, ACCOUNT_DELETION_CODE_MAX_LENGTH)
  @Matches(/^[a-zA-Z0-9]+$/u)
  code!: string
}
