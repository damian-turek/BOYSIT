import { Injectable } from '@nestjs/common'
import { QuestionWhereInput, UserPlan } from 'database'

import { PrismaService } from '../prisma/prisma.service'
import { GetQuestionsDto } from './dto/questions.dto'

const PLANS_WITH_FULL_ACCESS: UserPlan[] = ['pro', 'admin']

type LockableQuestion = {
  accessLevel: string
  questionText: string
  answerText: string | null
  explanation: string | null
  codeSnippet: string | null
}

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetQuestionsDto, viewerPlan: UserPlan) {
    const { search, accessLevel, categories, technologies, difficulty, type, page, limit } = query

    const where: QuestionWhereInput = {
      isActive: true,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { questionText: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categories && categories.length > 0) {
      where.category = {
        slug: { in: categories },
      }
    }

    if (technologies && technologies.length > 0) {
      where.technology = {
        slug: { in: technologies },
      }
    }
    if (difficulty) where.difficulty = difficulty
    if (type) where.questionType = type
    if (accessLevel) where.accessLevel = accessLevel

    const pageNumber = page ? Number(page) : 1
    const limitNumber = limit ? Number(limit) : 10

    const skip = (pageNumber - 1) * limitNumber
    const take = limitNumber

    const [data, total] = await this.prisma.client.$transaction([
      this.prisma.client.question.findMany({
        where,
        skip,
        take,
        // Explicit order so pagination is stable across pages - without
        // this Postgres is free to return rows in a different order on
        // every request, which can duplicate/skip rows between pages.
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          technology: { select: { id: true, name: true, slug: true } },
          questionTags: { select: { tag: true } },
        },
      }),
      this.prisma.client.question.count({ where }),
    ])

    return {
      data: data.map((question) => this.redactIfLocked(question, viewerPlan)),
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / take),
      },
    }
  }

  async findSingle(id: string, viewerPlan: UserPlan, viewerUserId?: string) {
    const data = await this.prisma.client.question.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        technology: { select: { id: true, name: true, slug: true } },
        questionTags: { select: { tag: true } },
      },
    })

    if (!data) return null

    // Neither of these depends on the other's result - run them together
    // instead of one after another.
    const [[nextQuestion]] = await Promise.all([
      this.prisma.client.question.findMany({
        where: { isActive: true },
        cursor: { id },
        skip: 1,
        take: 1,
        orderBy: { id: 'asc' },
        select: { id: true, title: true },
      }),
      viewerUserId ? this.recordView(viewerUserId, id) : Promise.resolve(),
    ])

    return {
      data: this.redactIfLocked(data, viewerPlan),
      nextQuestion: nextQuestion ?? null,
    }
  }

  /**
   * `accessLevel: 'pro'` means the FULL question (not just the answer) is
   * only visible to paying users - see the comment on the schema field.
   * Free-plan viewers still get the question back (so it renders as a
   * locked teaser card instead of a 404) but with every content field
   * stripped, plus a `locked: true` flag the frontend can key off of.
   *
   * This used to not exist at all: any authenticated user (including free
   * plan) could read the full text/answer of Pro-only questions straight
   * from the API, bypassing the paywall entirely.
   */
  private redactIfLocked<T extends LockableQuestion>(
    question: T,
    viewerPlan: UserPlan,
  ): T & { locked: boolean } {
    const hasAccess =
      question.accessLevel !== 'pro' || PLANS_WITH_FULL_ACCESS.includes(viewerPlan)

    if (hasAccess) {
      return { ...question, locked: false }
    }

    return {
      ...question,
      questionText: '',
      answerText: null,
      explanation: null,
      codeSnippet: null,
      locked: true,
    }
  }

  /**
   * Lightweight "view" log, piggy-backing on the otherwise-unused Attempt
   * table (userAnswer/score left null) so the dashboard's "Last Seen" list
   * has real data to show. Best-effort: a logging failure must never break
   * the question page itself.
   */
  private async recordView(userId: string, questionId: string): Promise<void> {
    try {
      await this.prisma.client.attempt.create({ data: { userId, questionId } })
    } catch {
      // ignore - viewing a question should never fail because of this
    }
  }

  /**
   * Full category/technology taxonomy for the filter dropdowns - deliberately
   * independent of any `where` clause. Deriving these from the current
   * (paginated, possibly already-filtered) question results would only ever
   * show whichever categories happen to appear on the current page/filter,
   * not everything that exists in the database.
   */
  async findCategories() {
    const categories = await this.prisma.client.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })
    return { data: categories }
  }

  async findTechnologies() {
    const technologies = await this.prisma.client.technology.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    })
    return { data: technologies }
  }
}
