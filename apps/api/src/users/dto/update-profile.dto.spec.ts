import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import 'reflect-metadata'
import { describe, expect, it } from 'vitest'

import { PROFILE_NAME_MAX_LENGTH, UpdateProfileDto } from './update-profile.dto'

const validateProfile = (name: unknown) => {
  const profile = plainToInstance(UpdateProfileDto, { name })
  return {
    profile,
    errors: validate(profile),
  }
}

describe('UpdateProfileDto', () => {
  it('trims a valid profile name', async () => {
    const { profile, errors } = validateProfile('  Ada Lovelace  ')

    await expect(errors).resolves.toHaveLength(0)
    expect(profile.name).toBe('Ada Lovelace')
  })

  it('rejects an empty profile name', async () => {
    const { errors } = validateProfile('   ')

    await expect(errors).resolves.not.toHaveLength(0)
  })

  it('rejects a profile name over the maximum length', async () => {
    const { errors } = validateProfile('a'.repeat(PROFILE_NAME_MAX_LENGTH + 1))

    await expect(errors).resolves.not.toHaveLength(0)
  })
})
