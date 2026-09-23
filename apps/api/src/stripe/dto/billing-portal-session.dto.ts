import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

export class CreateBillingPortalSessionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Matches(/^\/(?!\/)[^\s]*$/, {
    message: 'returnPath must be a path starting with a single "/" (e.g. "/en/dashboard/profile")',
  })
  returnPath!: string
}
