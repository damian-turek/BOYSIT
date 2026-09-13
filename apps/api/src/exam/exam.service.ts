import { BadRequestException, Injectable } from '@nestjs/common'
import { AccessLevel, Difficulty, UserPlan } from 'database'

import { PrismaService } from '../prisma/prisma.service'
import { ExamAnswerDto } from './dto/submit-exam.dto'

const PLANS_WITH_FULL_ACCESS: UserPlan[] = ['pro', 'admin']

// How many candidate questions we pull before shuffling - large enough to
// give a good random spread without scanning the whole table.
const CANDIDATE_POOL_SIZE = 200

export type ExamQuestion = {
  id: string
  title: string
  questionText: string
  answerText: string | null
  explanation: string | null
  codeSnippet: string | null
  category: string | null
  technology: string | null
}

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async startExam(userId: string, viewerPlan: UserPlan, difficulty: Difficulty, questionCount = 10) {
    const allowedAccessLevels: AccessLevel[] = PLANS_WITH_FULL_ACCESS.includes(viewerPlan)
      ? ['free', 'pro']
      : ['free']

    const candidates = await this.prisma.client.question.findMany({
      where: {
        isActive: true,
        difficulty,
        accessLevel: { in: allowedAccessLevels },
      },
      select: {
        id: true,
        title: true,
        questionText: true,
        answerText: true,
        explanation: true,
        codeSnippet: true,
        category: { select: { name: true } },
        technology: { select: { name: true } },
      },
      take: CANDIDATE_POOL_SIZE,
    })

    const selected = shuffle(candidates).slice(0, questionCount)

    const questions: ExamQuestion[] = selected.map((question) => ({
      id: question.id,
      title: question.title,
      questionText: question.questionText,
      answerText: question.answerText,
      explanation: question.explanation,
      codeSnippet: question.codeSnippet,
      category: question.category?.name ?? null,
      technology: question.technology?.name ?? null,
    }))

    return {
      difficulty,
      totalAvailable: candidates.length,
      totalQuestions: questions.length,
      questions,
    }
  }

  async submitExam(
    userId: string,
    difficulty: Difficulty,
    answers: ExamAnswerDto[],
    durationSeconds: number,
  ) {
    const questionIds = answers.map((answer) => answer.questionId)

    const existingQuestions = await this.prisma.client.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true },
    })
    const existingIds = new Set(existingQuestions.map((question) => question.id))

    const validAnswers = answers.filter((answer) => existingIds.has(answer.questionId))

    if (!validAnswers.length) {
      throw new BadRequestException('None of the submitted questions could be found')
    }

    await this.prisma.client.attempt.createMany({
      data: validAnswers.map((answer) => ({
        userId,
        questionId: answer.questionId,
        userAnswer: answer.knewIt ? 'knew_it' : 'did_not_know',
        score: answer.knewIt ? 1 : 0,
        feedback: `exam:${difficulty}`,
      })),
    })

    const correctCount = validAnswers.filter((answer) => answer.knewIt).length
    const totalQuestions = validAnswers.length

    return {
      difficulty,
      totalQuestions,
      correctCount,
      scorePercentage: Math.round((correctCount / totalQuestions) * 100),
      durationSeconds,
    }
  }
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
