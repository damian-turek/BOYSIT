import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { QuestionsService } from './questions.service'

const questionId = '5bf4e958-1555-40cd-a8de-f8f6641ab4f1'

describe('QuestionsService detail visibility', () => {
  const findFirst = vi.fn()
  const recordAttempt = vi.fn()
  const prisma = {
    client: {
      question: { findFirst },
      attempt: { create: recordAttempt },
    },
  } as unknown as PrismaService

  let service: QuestionsService

  beforeEach(() => {
    vi.resetAllMocks()
    service = new QuestionsService(prisma)
  })

  it('returns 404 and does not record a view when the question is inactive or absent', async () => {
    findFirst.mockResolvedValue(null)

    await expect(service.findSingle(questionId, 'free', questionId)).rejects.toBeInstanceOf(
      NotFoundException,
    )

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: questionId, isActive: true } }),
    )
    expect(recordAttempt).not.toHaveBeenCalled()
  })
})
