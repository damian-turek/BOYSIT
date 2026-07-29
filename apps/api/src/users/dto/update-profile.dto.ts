import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

export const PROFILE_NAME_MAX_LENGTH = 80

const profileNameContainsLetter = /\p{L}/u
const profileNameContainsNoControlCharacters = /^[^\u0000-\u001f\u007f-\u009f]+$/u

export const normalizeProfileName = (name: string): string =>
  name
    .normalize('NFC')
    .trim()
    .replace(/\p{Zs}+/gu, ' ')

export class UpdateProfileDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeProfileName(value) : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROFILE_NAME_MAX_LENGTH)
  @Matches(profileNameContainsLetter, {
    message: 'name must contain at least one letter',
  })
  @Matches(profileNameContainsNoControlCharacters, {
    message: 'name must not contain control characters',
  })
  name!: string
}
