import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import 'reflect-metadata'
import { describe, expect, it } from 'vitest'

import {
  ACCOUNT_DELETION_CODE_MAX_LENGTH,
  ACCOUNT_DELETION_CODE_MIN_LENGTH,
  DeleteAccountDto,
} from './delete-account.dto'

const validateCode = (code: unknown) => {
  const input = plainToInstance(DeleteAccountDto, { code })
  return {
    input,
    errors: validate(input),
  }
}

describe('DeleteAccountDto', () => {
  it('normalizes and accepts an account-deletion code', async () => {
    const { input, errors } = validateCode('12 AB 34 cd')

    await expect(errors).resolves.toHaveLength(0)
    expect(input.code).toBe('12AB34cd')
  })

  it.each([
    '1'.repeat(ACCOUNT_DELETION_CODE_MIN_LENGTH - 1),
    '1'.repeat(ACCOUNT_DELETION_CODE_MAX_LENGTH + 1),
    '1234-678',
    '',
    undefined,
    123,
  ])('rejects invalid code %j', async (code) => {
    const { errors } = validateCode(code)

    await expect(errors).resolves.not.toHaveLength(0)
  })
})
