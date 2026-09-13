import { Injectable } from '@nestjs/common'
import { AccessLevel, Difficulty, UserPlan } from 'database'

import { PrismaService } from '../prisma/prisma.service'

export type LibraryItem = {
  id: string
  tabId: 'saved' | 'last-seen' | 'for-you'
  title: string
  category: string
  level: string
  levelColor: string
  timeAgo: string
  link: string
}

const LEVEL_LABELS: Record<Difficulty, string> = {
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
}

const LEVEL_COLORS: Record<Difficulty, string> = {
  junior: '#00BC7D',
  middle: '#FE9A00',
  senior: '#FF2056',
}

type QuestionForItem = {
  id: string
  title: string
  difficulty: Difficulty
  category: { name: string } | null
}

const SAVED_LIMIT = 6
const LAST_SEEN_LIMIT = 4
const FOR_YOU_LIMIT = 4

@Injectable()
export class LibraryService {
  constructor(private readonly prismaService: PrismaService) {}

  /** Aggregated payload for the "My Library" dashboard widget. */
  async getLibrary(userId: string, plan: UserPlan) {
    // Independent reads - run them together instead of one after another.
    const [savedItems, lastSeenItems] = await Promise.all([
      this.getSavedItems(userId),
      this.getLastSeenItems(userId),
    ])

    const excludeIds = new Set<string>([
      ...savedItems.map((item) => item.id),
      ...lastSeenItems.map((item) => item.id),
    ])

    const forYouItems = await this.getForYouItems(userId, plan, excludeIds)

    return { data: { savedItems, lastSeenItems, forYouItems } }
  }

  async toggleBookmark(userId: string, questionId: string): Promise<{ bookmarked: boolean }> {
    const existing = await this.prismaService.client.bookmark.findUnique({
      where: { userId_questionId: { userId, questionId } },
    })

    if (existing) {
      await this.prismaService.client.bookmark.delete({
        where: { userId_questionId: { userId, questionId } },
      })
      return { bookmarked: false }
    }

    await this.prismaService.client.bookmark.create({ data: { userId, questionId } })
    return { bookmarked: true }
  }

  private async getSavedItems(userId: string): Promise<LibraryItem[]> {
    const bookmarks = await this.prismaService.client.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: SAVED_LIMIT,
      include: {
        question: {
          select: { id: true, title: true, difficulty: true, category: { select: { name: true } } },
        },
      },
    })

    return bookmarks.map((bookmark) =>
      this.toLibraryItem(bookmark.question, 'saved', bookmark.createdAt),
    )
  }

  /**
   * "Last seen" has no dedicated table - we piggyback on the (otherwise
   * unused) Attempt table as a lightweight view log: opening a question
   * detail page records a view-only Attempt row (see QuestionsService).
   */
  private async getLastSeenItems(userId: string): Promise<LibraryItem[]> {
    const grouped = await this.prismaService.client.attempt.groupBy({
      by: ['questionId'],
      where: { userId },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
      take: LAST_SEEN_LIMIT,
    })

    if (!grouped.length) return []

    const questions = await this.prismaService.client.question.findMany({
      where: { id: { in: grouped.map((group) => group.questionId) } },
      select: { id: true, title: true, difficulty: true, category: { select: { name: true } } },
    })
    const questionById = new Map(questions.map((question) => [question.id, question]))

    return grouped
      .map((group) => {
        const question = questionById.get(group.questionId)
        if (!question || !group._max.createdAt) return null
        return this.toLibraryItem(question, 'last-seen', group._max.createdAt)
      })
      .filter((item): item is LibraryItem => item !== null)
  }

  /**
   * Simple recommendation heuristic: active questions the user hasn't
   * bookmarked or viewed yet, matching their plan's access level, biased
   * towards the category they interact with the most (if any).
   */
  private async getForYouItems(
    userId: string,
    plan: UserPlan,
    excludeIds: Set<string>,
  ): Promise<LibraryItem[]> {
    const accessLevels: AccessLevel[] = plan === 'free' ? ['free'] : ['free', 'pro']

    const recentInteractions = await this.prismaService.client.attempt.findMany({
      where: { userId },
      select: { question: { select: { categoryId: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const categoryCounts = new Map<string, number>()
    for (const interaction of recentInteractions) {
      const categoryId = interaction.question.categoryId
      if (!categoryId) continue
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1)
    }
    const topCategoryId = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

    const baseWhere = {
      isActive: true,
      accessLevel: { in: accessLevels },
      ...(excludeIds.size ? { id: { notIn: [...excludeIds] } } : {}),
    }

    let questions: QuestionForItem[] = []

    if (topCategoryId) {
      questions = await this.prismaService.client.question.findMany({
        where: { ...baseWhere, categoryId: topCategoryId },
        select: {
          id: true,
          title: true,
          difficulty: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: FOR_YOU_LIMIT,
      })
    }

    if (questions.length < FOR_YOU_LIMIT) {
      const alreadyPicked = new Set(questions.map((question) => question.id))
      const filler = await this.prismaService.client.question.findMany({
        where: {
          ...baseWhere,
          ...(alreadyPicked.size ? { id: { notIn: [...alreadyPicked, ...excludeIds] } } : {}),
        },
        select: {
          id: true,
          title: true,
          difficulty: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: FOR_YOU_LIMIT - questions.length,
      })
      questions = [...questions, ...filler]
    }

    return questions.map((question) => this.toLibraryItem(question, 'for-you', null))
  }

  private toLibraryItem(
    question: QuestionForItem,
    tabId: LibraryItem['tabId'],
    when: Date | null,
  ): LibraryItem {
    return {
      id: question.id,
      tabId,
      title: question.title,
      category: question.category?.name ?? 'General',
      level: LEVEL_LABELS[question.difficulty],
      levelColor: LEVEL_COLORS[question.difficulty],
      timeAgo: when ? when.toISOString() : '',
      link: `/dashboard/questions/${question.id}`,
    }
  }
}
