import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AddQuestionDto, GetQuestionDto } from './dto/questions.dto'
import { Prisma } from 'database/dist/generated/prisma/client'

@Injectable()
export class QuestionsService {
  constructor(private readonly questions: PrismaService) {}

  async findFilteredQuestions(query: GetQuestionDto) {
    const page = query.page || 1
    const take = 20;

    const [questions, totalCount] = await this.questions.client.$transaction([
      this.questions.client.question.findMany({
        where: {
          technology: { slug: query.technology },
          questionType: query.type,
          difficulty: query.difficulty,
          title: {
            mode: 'insensitive',
            contains: query.search
          }
        },
        include: {
          category: true,
          technology: true
        },
        skip: 20 * (page - 1),
        take: 20,
        orderBy: { id: 'asc' }
      }),
      this.questions.client.question.count({
        where: {
          technology: { slug: query.technology },
          questionType: query.type,
          difficulty: query.difficulty,
          title: {
            mode: 'insensitive',
            contains: query.search
          }
        },
        orderBy: { id: 'asc' }
      })
    ])

    return {
      data: questions,
      meta: {
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / take)
      }
    }
  }

  async findSingle(id: string) {
    return this.questions.client.question.findUnique({
      where: {
        id: id,
      }
    })
  }

  async createQuestion(query: AddQuestionDto) {
    try {
      const { categoryId, technologyId, ...restOfData } = query

      return this.questions.client.question.create({
        data: {
          ...restOfData,
          ...(categoryId && { category: { connect: { id: categoryId } } }),
          ...(technologyId && { technology: { connect: { id: technologyId } } }),
        }
      })

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Question with this slug already exists')
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new InternalServerErrorException(`Error: ${errorMessage}`)
    }
  }
}