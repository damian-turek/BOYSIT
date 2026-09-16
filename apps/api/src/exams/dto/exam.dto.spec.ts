import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Assessment } from 'database'
import { describe, expect, it } from 'vitest'

import { StartExamSessionDto } from './start-exam-session.dto'
import { SubmitExamAssessmentDto } from './submit-exam-assessment.dto'

describe('exam DTOs', () => {
  it.each([20, 30, 50])('accepts a %s-card deck size', async (questionCount) => {
    const input = plainToInstance(StartExamSessionDto, { questionCount })
    await expect(validate(input)).resolves.toHaveLength(0)
  })

  it('rejects a string card count', async () => {
    const input = plainToInstance(StartExamSessionDto, { questionCount: '30' })
    const errors = await validate(input)
    expect(errors.some((error) => error.property === 'questionCount')).toBe(true)
  })

  it.each([0, 1.5, 101])('rejects the invalid card count %s', async (questionCount) => {
    const input = plainToInstance(StartExamSessionDto, { questionCount })
    const errors = await validate(input)
    expect(errors.some((error) => error.property === 'questionCount')).toBe(true)
  })

  it.each(Object.values(Assessment))('accepts the %s assessment', async (assessment) => {
    const input = plainToInstance(SubmitExamAssessmentDto, { assessment })
    await expect(validate(input)).resolves.toHaveLength(0)
  })

  it('rejects an unsupported assessment', async () => {
    const input = plainToInstance(SubmitExamAssessmentDto, { assessment: 'almost' })
    const errors = await validate(input)

    expect(errors.some((error) => error.property === 'assessment')).toBe(true)
  })
})
