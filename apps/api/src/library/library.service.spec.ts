import { NotFoundException } from '@nestjs/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { LibraryService } from './library.service'

describe('LibraryService question visibility', () => {
  const saved = vi.fn()
  const recent = vi.fn()
  const interactions = vi.fn()
  const questions = vi.fn()
  const question = vi.fn()
  const existingBookmark = vi.fn()
  const createBookmark = vi.fn()
  const deleteBookmark = vi.fn()
  const prisma = {
    client: {
      bookmark: {
        findMany: saved,
        findUnique: existingBookmark,
        create: createBookmark,
        delete: deleteBookmark,
      },
      attempt: { groupBy: recent, findMany: interactions },
      question: { findMany: questions, findFirst: question },
    },
  } as unknown as PrismaService
  let service: LibraryService

  beforeEach(() => {
    vi.resetAllMocks()
    saved.mockResolvedValue([])
    recent.mockResolvedValue([{ questionId: 'recent-id', _max: { createdAt: new Date() } }])
    interactions.mockResolvedValue([{ question: { categoryId: 'category-id' } }])
    questions.mockResolvedValue([])
    existingBookmark.mockResolvedValue(null)
    service = new LibraryService(prisma)
  })

  it.each(['free', 'pro', 'admin'] as const)(
    'scopes saved, recent and recommended questions to the current %s plan',
    async (plan) => {
      await service.getLibrary('user-id', plan)
      const visibility =
        plan === 'free' ? { isActive: true, accessLevel: 'free' } : { isActive: true }

      expect(saved).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id', question: visibility } }),
      )
      expect(recent).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id', question: visibility } }),
      )
      expect(interactions).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-id', question: visibility } }),
      )
      expect(questions).toHaveBeenCalledTimes(3)
      for (const [query] of questions.mock.calls) {
        expect(query.where).toMatchObject(visibility)
        if (plan !== 'free') expect(query.where).not.toHaveProperty('accessLevel')
      }
    },
  )

  it('rejects bookmarking an inaccessible question without exposing its metadata', async () => {
    question.mockResolvedValue(null)

    await expect(service.toggleBookmark('user-id', 'pro-id', 'free')).rejects.toBeInstanceOf(
      NotFoundException,
    )
    expect(question).toHaveBeenCalledWith({
      where: { id: 'pro-id', isActive: true, accessLevel: 'free' },
      select: { id: true },
    })
    expect(createBookmark).not.toHaveBeenCalled()
  })

  it('allows a user to remove an old bookmark after losing access', async () => {
    existingBookmark.mockResolvedValue({ userId: 'user-id', questionId: 'pro-id' })

    await expect(service.toggleBookmark('user-id', 'pro-id', 'free')).resolves.toEqual({
      bookmarked: false,
    })
    expect(deleteBookmark).toHaveBeenCalledWith({
      where: { userId_questionId: { userId: 'user-id', questionId: 'pro-id' } },
    })
    expect(question).not.toHaveBeenCalled()
  })
})
