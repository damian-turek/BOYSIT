import { Injectable } from '@nestjs/common'
import { QuestionWhereInput } from 'database'

import { PrismaService } from '../prisma/prisma.service'
import { GetQuestionsDto } from './dto/questions.dto'

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetQuestionsDto) {
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
        include: {
          category: { select: { id: true, name: true, slug: true } },
          technology: { select: { id: true, name: true, slug: true } },
          questionTags: { select: { tag: true } },
        },
      }),
      this.prisma.client.question.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / take),
      },
    }
  }

  async findSingle(id: string) {
    const data = await this.prisma.client.question.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        technology: { select: { id: true, name: true, slug: true } },
        questionTags: { select: { tag: true } },
      },
    })

    if (!data) return null

    const [nextQuestion] = await this.prisma.client.question.findMany({
      where: { isActive: true },
      cursor: { id },
      skip: 1,
      take: 1,
      orderBy: { id: 'asc' },
      select: { id: true, title: true },
    })

    return {
      data,
      nextQuestion: nextQuestion ?? null,
    }
  }
}
