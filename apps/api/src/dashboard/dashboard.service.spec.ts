import { describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { DashboardService } from './dashboard.service'

describe('DashboardService question counts', () => {
  it.each(['free', 'pro', 'admin'] as const)('counts only the visible %s pool', async (plan) => {
    const countQuestions = vi.fn().mockResolvedValue(3)
    const groupQuestions = vi.fn().mockResolvedValue([])
    const prisma = {
      client: {
        question: { count: countQuestions, groupBy: groupQuestions },
        category: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
        technology: {
          count: vi.fn().mockResolvedValue(0),
          findMany: vi.fn().mockResolvedValue([]),
        },
        user: { count: vi.fn().mockResolvedValue(1) },
        jobApplication: { count: vi.fn().mockResolvedValue(0) },
      },
    } as unknown as PrismaService

    const result = await new DashboardService(prisma).getOverview('user-id', plan)
    const visibility =
      plan === 'free' ? { isActive: true, accessLevel: 'free' } : { isActive: true }

    expect(countQuestions).toHaveBeenCalledWith({ where: visibility })
    expect(groupQuestions).toHaveBeenCalledTimes(2)
    for (const [query] of groupQuestions.mock.calls) {
      expect(query.where).toMatchObject(visibility)
      if (plan !== 'free') expect(query.where).not.toHaveProperty('accessLevel')
    }
    expect(result.data.questionsBank.total).toBe(3)
    expect(result.data.practiceTools.questions).toBe(3)
  })
})
