import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { QuestionsService } from './questions.service'

const questionId = '5bf4e958-1555-40cd-a8de-f8f6641ab4f1'

describe('QuestionsService detail visibility', () => {
  const findFirst = vi.fn()
  const findMany = vi.fn()
  const count = vi.fn()
  const transaction = vi.fn()
  const recordAttempt = vi.fn()
  const prisma = {
    client: {
      question: { findFirst, findMany, count },
      attempt: { create: recordAttempt },
      $transaction: transaction,
    },
  } as unknown as PrismaService

  let service: QuestionsService

  beforeEach(() => {
    vi.resetAllMocks()
    findMany.mockResolvedValue([])
    count.mockResolvedValue(0)
    transaction.mockImplementation((operations: Promise<unknown>[]) => Promise.all(operations))
    service = new QuestionsService(prisma)
  })

  it('returns 404 and does not record a view when the question is inactive or absent', async () => {
    findFirst.mockResolvedValue(null)

    await expect(service.findSingle(questionId, 'free', questionId)).rejects.toBeInstanceOf(
      NotFoundException,
    )

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: questionId, isActive: true, accessLevel: 'free' } }),
    )
    expect(recordAttempt).not.toHaveBeenCalled()
  })

  it('applies the Free pool to catalogue/search and totals before pagination', async () => {
    await service.findAll(
      { search: 'closure', categories: ['frontend'], page: 2, limit: 5 },
      'free',
    )

    const where = {
      isActive: true,
      accessLevel: 'free',
      category: { slug: { in: ['frontend'] } },
      OR: expect.any(Array),
    }
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where, skip: 5, take: 5 }))
    expect(count).toHaveBeenCalledWith({ where })
  })

  it('does not let an accessLevel=pro query replace the Free entitlement constraint', async () => {
    await service.findAll({ accessLevel: 'pro' }, 'free')

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, accessLevel: 'free', AND: [{ accessLevel: 'pro' }] },
      }),
    )
  })

  it('returns a small Free pool with its answers without requiring 20 questions', async () => {
    findMany.mockResolvedValue([{ id: questionId, accessLevel: 'free', answerText: 'Free answer' }])
    count.mockResolvedValue(1)

    const result = await service.findAll({ limit: 20 }, 'free')

    expect(result.data).toEqual([
      { id: questionId, accessLevel: 'free', answerText: 'Free answer', locked: false },
    ])
    expect(result.meta).toMatchObject({ total: 1, totalPages: 1 })
  })

  it('never returns preview metadata for an inaccessible Pro UUID', async () => {
    findFirst.mockResolvedValue(null)

    await expect(service.findSingle(questionId, 'free', questionId)).rejects.toMatchObject({
      response: { error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found' } },
    })
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: questionId, isActive: true, accessLevel: 'free' } }),
    )
    expect(findMany).not.toHaveBeenCalled()
    expect(recordAttempt).not.toHaveBeenCalled()
  })

  it('returns a Free answer and restricts the next-question link to the same pool', async () => {
    findFirst.mockResolvedValue({
      id: questionId,
      accessLevel: 'free',
      answerText: 'A free answer',
    })
    findMany.mockResolvedValue([{ id: 'next-free-id', title: 'Next free question' }])

    const result = await service.findSingle(questionId, 'free', questionId)

    expect(result.data).toMatchObject({ answerText: 'A free answer', locked: false })
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true, accessLevel: 'free' } }),
    )
    expect(recordAttempt).toHaveBeenCalledWith({ data: { userId: questionId, questionId } })
  })

  it.each(['pro', 'admin'] as const)(
    'preserves full active-question access for %s',
    async (plan) => {
      findFirst.mockResolvedValue({
        id: questionId,
        accessLevel: 'pro',
        answerText: 'A Pro answer',
      })

      await service.findAll({}, plan)
      const detail = await service.findSingle(questionId, plan)

      expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isActive: true } }))
      expect(findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: questionId, isActive: true } }),
      )
      expect(detail.data).toMatchObject({ answerText: 'A Pro answer', locked: false })
    },
  )
})
