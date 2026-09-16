import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { AccessLevel, Assessment, ExamSessionStatus, Prisma, type User, UserPlan } from 'database'

import { PrismaService } from '../prisma/prisma.service'
import type { StartExamSessionDto } from './dto/start-exam-session.dto'
import type { SubmitExamAssessmentDto } from './dto/submit-exam-assessment.dto'
import {
  EXAM_PRESETS,
  type ExamPreset,
  getAllowedQuestionAccessLevels,
  getExamPreset,
} from './exam-presets'

const sessionInclude = {
  questions: {
    orderBy: { position: 'asc' as const },
    include: {
      question: {
        select: {
          id: true,
          title: true,
          questionText: true,
          answerText: true,
          explanation: true,
          codeSnippet: true,
          difficulty: true,
          questionType: true,
          category: { select: { id: true, name: true, slug: true } },
          technology: { select: { id: true, name: true, slug: true } },
        },
      },
      attempt: {
        select: {
          id: true,
          assessment: true,
        },
      },
    },
  },
} satisfies Prisma.ExamSessionInclude

type SessionWithQuestions = Prisma.ExamSessionGetPayload<{ include: typeof sessionInclude }>
type ExamUser = Pick<User, 'id' | 'plan'>

@Injectable()
export class ExamsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCatalog(user: ExamUser) {
    const activeSessions = await this.prismaService.client.examSession.findMany({
      where: {
        userId: user.id,
        status: {
          in: [ExamSessionStatus.in_progress, ExamSessionStatus.review, ExamSessionStatus.expired],
        },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, examSlug: true },
    })
    const activeSessionBySlug = new Map<string, string>()

    for (const session of activeSessions) {
      if (!activeSessionBySlug.has(session.examSlug)) {
        activeSessionBySlug.set(session.examSlug, session.id)
      }
    }

    const availableCounts = await Promise.all(
      EXAM_PRESETS.map((preset) =>
        this.prismaService.client.question.count({ where: this.getQuestionWhere(preset) }),
      ),
    )

    return {
      data: EXAM_PRESETS.map((preset, index) => {
        const availableQuestionCount = availableCounts[index] ?? 0
        const activeSessionId = activeSessionBySlug.get(preset.slug) ?? null
        const requiresPro = preset.access === AccessLevel.pro && !this.hasProAccess(user)
        const supportedQuestionCountOptions = preset.questionCountOptions.filter(
          (questionCount) => questionCount <= availableQuestionCount,
        )
        const availableQuestionCountOptions =
          supportedQuestionCountOptions.length > 0
            ? supportedQuestionCountOptions
            : availableQuestionCount > 0
              ? preset.questionCountOptions.slice(0, 1)
              : []
        const hasQuestions = availableQuestionCount > 0
        const lockReason = requiresPro
          ? 'pro_required'
          : !hasQuestions && !activeSessionId
            ? 'insufficient_questions'
            : null

        return {
          slug: preset.slug,
          category: preset.category,
          access: preset.access,
          displayDifficulty: preset.displayDifficulty,
          questionCountOptions: [...preset.questionCountOptions],
          availableQuestionCountOptions,
          topics: preset.topics,
          availableQuestionCount,
          activeSessionId,
          canStart: !requiresPro && (Boolean(activeSessionId) || hasQuestions),
          lockReason,
        }
      }),
    }
  }

  async startSession(user: ExamUser, slug: string, input: StartExamSessionDto = {}) {
    const preset = this.requirePreset(slug)
    this.ensurePresetAccess(user, preset)
    const questionCount = this.resolveQuestionCount(preset, input.questionCount)

    const data = await this.prismaService.client.$transaction(async (transaction) => {
      const activeSession = await transaction.examSession.findFirst({
        where: {
          userId: user.id,
          examSlug: preset.slug,
          status: {
            in: [
              ExamSessionStatus.in_progress,
              ExamSessionStatus.review,
              ExamSessionStatus.expired,
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true },
      })

      if (activeSession) {
        return {
          sessionId: activeSession.id,
          status: activeSession.status,
          resumed: true,
        }
      }

      const questionWhere = this.getQuestionWhere(preset)
      const availableQuestionCount = await transaction.question.count({ where: questionWhere })

      if (availableQuestionCount === 0) {
        throw new ConflictException({
          error: {
            code: 'EXAM_QUESTIONS_UNAVAILABLE',
            message: 'There are no eligible questions to start this exam',
          },
        })
      }

      const sessionQuestionCount = Math.min(questionCount, availableQuestionCount)

      const selectedQuestions =
        preset.access === AccessLevel.free
          ? await this.selectFixedPreviewQuestions(transaction, questionWhere, sessionQuestionCount)
          : await this.selectQuestions(
              transaction,
              questionWhere,
              availableQuestionCount,
              sessionQuestionCount,
            )

      if (selectedQuestions.length !== sessionQuestionCount) {
        throw new ConflictException({
          error: {
            code: 'EXAM_QUESTIONS_UNAVAILABLE',
            message: 'The eligible question pool changed while the exam was starting',
          },
        })
      }
      const session = await transaction.examSession.create({
        data: {
          userId: user.id,
          examSlug: preset.slug,
          questionCount: sessionQuestionCount,
          durationMinutes: null,
          expiresAt: null,
          questions: {
            create: selectedQuestions.map(({ id: questionId }, index) => ({
              questionId,
              position: index + 1,
            })),
          },
        },
        select: { id: true, status: true },
      })

      return {
        sessionId: session.id,
        status: session.status,
        resumed: false,
      }
    })

    return { data }
  }

  async getSession(user: ExamUser, sessionId: string) {
    const session = await this.getOwnedSession(user, sessionId)
    return { data: this.formatSession(session) }
  }

  async submitAssessment(
    user: ExamUser,
    sessionId: string,
    questionId: string,
    input: SubmitExamAssessmentDto,
  ) {
    const session = await this.getOwnedSession(user, sessionId)
    this.ensureSessionAssessable(session)

    const sessionQuestion = session.questions.find((item) => item.questionId === questionId)
    if (!sessionQuestion) throw this.questionNotFound()

    const attempt = await this.prismaService.client.$transaction(async (transaction) => {
      const assessableSessionCount = await transaction.examSession.count({
        where: {
          id: sessionId,
          userId: user.id,
          status: {
            in: [
              ExamSessionStatus.in_progress,
              ExamSessionStatus.review,
              ExamSessionStatus.expired,
            ],
          },
        },
      })

      if (assessableSessionCount === 0) {
        throw new ConflictException({
          error: {
            code: 'EXAM_SESSION_NOT_ASSESSABLE',
            message: 'This exam session no longer accepts assessments',
          },
        })
      }

      const createdAttempt = await transaction.attempt.create({
        data: {
          userId: user.id,
          questionId,
          userAnswer: null,
          assessment: input.assessment,
        },
        select: { id: true, assessment: true, createdAt: true },
      })

      await transaction.examSessionQuestion.update({
        where: {
          sessionId_questionId: { sessionId, questionId },
        },
        data: { attemptId: createdAttempt.id },
      })

      return createdAttempt
    })

    return {
      data: {
        questionId,
        assessment: attempt.assessment,
        assessedAt: attempt.createdAt.toISOString(),
      },
    }
  }

  async completeReview(user: ExamUser, sessionId: string) {
    const session = await this.getOwnedSession(user, sessionId)

    if (session.status === ExamSessionStatus.completed) {
      return { data: this.formatResult(session) }
    }

    this.ensureSessionAssessable(session)
    const remainingAssessments = session.questions.filter(
      (question) => question.attempt?.assessment == null,
    ).length

    if (remainingAssessments > 0) {
      throw new ConflictException({
        error: {
          code: 'EXAM_ASSESSMENTS_INCOMPLETE',
          message: 'Assess every question before completing the review',
          remainingAssessments,
        },
      })
    }

    await this.prismaService.client.examSession.update({
      where: { id: session.id },
      data: {
        status: ExamSessionStatus.completed,
        submittedAt: new Date(),
        completedAt: new Date(),
      },
    })

    const completedSession = await this.getOwnedSession(user, sessionId)
    return { data: this.formatResult(completedSession) }
  }

  async getResult(user: ExamUser, sessionId: string) {
    const session = await this.getOwnedSession(user, sessionId)
    if (session.status !== ExamSessionStatus.completed) {
      throw new ConflictException({
        error: {
          code: 'EXAM_SESSION_NOT_COMPLETED',
          message: 'Complete all flashcards before viewing the result',
        },
      })
    }
    return { data: this.formatResult(session) }
  }

  private getQuestionWhere(preset: ExamPreset): Prisma.QuestionWhereInput {
    const { questionFilter } = preset

    return {
      isActive: true,
      verified: true,
      accessLevel: { in: [...getAllowedQuestionAccessLevels(preset)] },
      ...(questionFilter.categorySlugs?.length
        ? {
            category: {
              is: {
                slug: { in: [...questionFilter.categorySlugs] },
                isActive: true,
              },
            },
          }
        : {}),
      ...(questionFilter.technologySlugs?.length
        ? {
            technology: {
              is: {
                slug: { in: [...questionFilter.technologySlugs] },
                isActive: true,
              },
            },
          }
        : {}),
      ...(questionFilter.difficulties?.length
        ? { difficulty: { in: [...questionFilter.difficulties] } }
        : {}),
      ...(questionFilter.questionTypes?.length
        ? { questionType: { in: [...questionFilter.questionTypes] } }
        : {}),
    }
  }

  private async selectQuestions(
    transaction: Prisma.TransactionClient,
    where: Prisma.QuestionWhereInput,
    availableQuestionCount: number,
    questionCount: number,
  ) {
    const offset = Math.floor(Math.random() * availableQuestionCount)
    const firstBatchSize = Math.min(questionCount, availableQuestionCount - offset)
    const firstBatch = await transaction.question.findMany({
      where,
      orderBy: { id: 'asc' },
      skip: offset,
      take: firstBatchSize,
      select: { id: true },
    })
    const secondBatch =
      firstBatch.length < questionCount
        ? await transaction.question.findMany({
            where,
            orderBy: { id: 'asc' },
            take: questionCount - firstBatch.length,
            select: { id: true },
          })
        : []

    return this.shuffle([...firstBatch, ...secondBatch])
  }

  private async selectFixedPreviewQuestions(
    transaction: Prisma.TransactionClient,
    where: Prisma.QuestionWhereInput,
    questionCount: number,
  ) {
    return transaction.question.findMany({
      where,
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      take: questionCount,
      select: { id: true },
    })
  }

  private shuffle<T>(items: T[]): T[] {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1))
      const current = items[index]
      const replacement = items[target]

      if (current === undefined || replacement === undefined) continue
      items[index] = replacement
      items[target] = current
    }

    return items
  }

  private async getOwnedSession(user: ExamUser, sessionId: string): Promise<SessionWithQuestions> {
    const session = await this.prismaService.client.examSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: sessionInclude,
    })

    if (!session) throw this.sessionNotFound()

    const preset = this.requirePreset(session.examSlug)
    this.ensurePresetAccess(user, preset)

    return session
  }

  private formatSession(session: SessionWithQuestions) {
    const preset = this.requirePreset(session.examSlug)

    return {
      id: session.id,
      examSlug: session.examSlug,
      access: preset.access,
      status: session.status,
      questionCount: session.questionCount,
      startedAt: session.startedAt.toISOString(),
      submittedAt: session.submittedAt?.toISOString() ?? null,
      completedAt: session.completedAt?.toISOString() ?? null,
      questions: session.questions.map((sessionQuestion) => ({
        id: sessionQuestion.question.id,
        position: sessionQuestion.position,
        title: sessionQuestion.question.title,
        questionText: sessionQuestion.question.questionText,
        difficulty: sessionQuestion.question.difficulty,
        questionType: sessionQuestion.question.questionType,
        category: sessionQuestion.question.category,
        technology: sessionQuestion.question.technology,
        assessment: sessionQuestion.attempt?.assessment ?? null,
        answerText: sessionQuestion.question.answerText,
        explanation: sessionQuestion.question.explanation,
        codeSnippet: sessionQuestion.question.codeSnippet,
      })),
    }
  }

  private formatResult(session: SessionWithQuestions) {
    const questions = this.formatSession(session).questions
    const assessmentCounts = session.questions.reduce<Record<Assessment, number>>(
      (counts, question) => {
        const assessment = question.attempt?.assessment
        if (assessment) counts[assessment] += 1
        return counts
      },
      {
        [Assessment.know]: 0,
        [Assessment.partial]: 0,
        [Assessment.dont_know]: 0,
      },
    )

    return {
      id: session.id,
      examSlug: session.examSlug,
      status: session.status,
      startedAt: session.startedAt.toISOString(),
      submittedAt: session.submittedAt?.toISOString() ?? null,
      completedAt: session.completedAt?.toISOString() ?? null,
      summary: {
        total: session.questions.length,
        assessed: Object.values(assessmentCounts).reduce((total, count) => total + count, 0),
        know: assessmentCounts[Assessment.know],
        partial: assessmentCounts[Assessment.partial],
        dontKnow: assessmentCounts[Assessment.dont_know],
      },
      questions,
    }
  }

  private requirePreset(slug: string): ExamPreset {
    const preset = getExamPreset(slug)
    if (preset) return preset

    throw new NotFoundException({
      error: {
        code: 'EXAM_NOT_FOUND',
        message: 'Exam was not found',
      },
    })
  }

  private hasProAccess(user: ExamUser): boolean {
    return user.plan === UserPlan.pro || user.plan === UserPlan.admin
  }

  private ensurePresetAccess(user: ExamUser, preset: ExamPreset): void {
    if (preset.access === AccessLevel.free || this.hasProAccess(user)) return

    throw new ForbiddenException({
      error: {
        code: 'EXAM_PRO_REQUIRED',
        message: 'A Pro plan is required to access this exam',
      },
    })
  }

  private resolveQuestionCount(preset: ExamPreset, requestedQuestionCount?: number): number {
    if (preset.access === AccessLevel.free) return preset.questionCountOptions[0]

    const questionCount = requestedQuestionCount ?? preset.questionCountOptions[0]
    if (preset.questionCountOptions.includes(questionCount)) return questionCount

    throw new BadRequestException({
      error: {
        code: 'EXAM_CARD_COUNT_INVALID',
        message: 'Choose one of the available card counts for this topic',
        allowedQuestionCounts: [...preset.questionCountOptions],
      },
    })
  }

  private ensureSessionAssessable(session: SessionWithQuestions): void {
    const assessableStatuses: ExamSessionStatus[] = [
      ExamSessionStatus.in_progress,
      ExamSessionStatus.review,
      ExamSessionStatus.expired,
    ]

    if (assessableStatuses.includes(session.status)) {
      return
    }

    throw new ConflictException({
      error: {
        code: 'EXAM_SESSION_NOT_ASSESSABLE',
        message: 'This flashcard session no longer accepts assessments',
      },
    })
  }

  private sessionNotFound(): NotFoundException {
    return new NotFoundException({
      error: {
        code: 'EXAM_SESSION_NOT_FOUND',
        message: 'Exam session was not found',
      },
    })
  }

  private questionNotFound(): NotFoundException {
    return new NotFoundException({
      error: {
        code: 'EXAM_SESSION_QUESTION_NOT_FOUND',
        message: 'Question was not found in this exam session',
      },
    })
  }
}
