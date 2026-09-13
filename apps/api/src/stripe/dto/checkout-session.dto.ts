import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator'

export class CreateCheckoutSessionDto {
  /** Internal plan identifier, e.g. "pro_monthly" - see stripe-plans.ts */
  @IsString()
  @IsNotEmpty()
  planId!: string

  /**
   * Where to send the browser back to after Stripe Checkout, relative to
   * our own app (e.g. "/pl/dashboard"). Deliberately NOT a full URL: Stripe
   * needs an absolute success/cancel URL, but building it from a
   * client-supplied absolute URL would let anyone redirect a paying user
   * to an arbitrary external site right after a real payment (open
   * redirect / phishing setup). The absolute URL is built server-side from
   * our own configured APP_URL instead - see stripe.service.ts.
   */
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @Matches(/^\/(?!\/)[^\s]*$/, {
    message: 'returnPath must be a path starting with a single "/" (e.g. "/en/dashboard")',
  })
  returnPath!: string
}
