import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Assessment } from 'database'
import { describe, expect, it } from 'vitest'

import { EXAM_ANSWER_MAX_LENGTH, SaveExamAnswerDto } from './save-exam-answer.dto'
import { SubmitExamAssessmentDto } from './submit-exam-assessment.dto'

describe('exam DTOs', () => {
  it('accepts an empty answer so the user can clear a saved response', async () => {
    const input = plainToInstance(SaveExamAnswerDto, { userAnswer: '' })
    await expect(validate(input)).resolves.toHaveLength(0)
  })

  it('rejects an oversized answer', async () => {
    const input = plainToInstance(SaveExamAnswerDto, {
      userAnswer: 'a'.repeat(EXAM_ANSWER_MAX_LENGTH + 1),
    })
    const errors = await validate(input)

    expect(errors.some((error) => error.property === 'userAnswer')).toBe(true)
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
