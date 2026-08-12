import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { AccessLevel, Assessment, ExamSessionStatus, Prisma, type User, UserPlan } from 'database'

import { PrismaService } from '../prisma/prisma.service'
import type { SaveExamAnswerDto } from './dto/save-exam-answer.dto'
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
    const now = new Date()
    const activeSessions = await this.prismaService.client.examSession.findMany({
      where: {
        userId: user.id,
        status: ExamSessionStatus.in_progress,
        expiresAt: { gt: now },
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
        const hasEnoughQuestions = availableQuestionCount >= preset.questionCount
        const lockReason = requiresPro
          ? 'pro_required'
          : !hasEnoughQuestions && !activeSessionId
            ? 'insufficient_questions'
            : null

        return {
          slug: preset.slug,
          category: preset.category,
          access: preset.access,
          displayDifficulty: preset.displayDifficulty,
          questionCount: preset.questionCount,
          durationMinutes: preset.durationMinutes,
          topics: preset.topics,
          availableQuestionCount,
          activeSessionId,
          canStart: !requiresPro && (Boolean(activeSessionId) || hasEnoughQuestions),
          lockReason,
        }
      }),
    }
  }

  async startSession(user: ExamUser, slug: string) {
    const preset = this.requirePreset(slug)
    this.ensurePresetAccess(user, preset)

    const now = new Date()
    const data = await this.prismaService.client.$transaction(async (transaction) => {
      await transaction.examSession.updateMany({
        where: {
          userId: user.id,
          examSlug: preset.slug,
          status: ExamSessionStatus.in_progress,
          expiresAt: { lte: now },
        },
        data: {
          status: ExamSessionStatus.expired,
          submittedAt: now,
        },
      })

      const activeSession = await transaction.examSession.findFirst({
        where: {
          userId: user.id,
          examSlug: preset.slug,
          status: ExamSessionStatus.in_progress,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, expiresAt: true },
      })

      if (activeSession) {
        return {
          sessionId: activeSession.id,
          status: activeSession.status,
          expiresAt: activeSession.expiresAt.toISOString(),
          resumed: true,
        }
      }

      const questionWhere = this.getQuestionWhere(preset)
      const availableQuestionCount = await transaction.question.count({ where: questionWhere })

      if (availableQuestionCount < preset.questionCount) {
        throw new ConflictException({
          error: {
            code: 'EXAM_QUESTIONS_UNAVAILABLE',
            message: 'There are not enough eligible questions to start this exam',
            availableQuestionCount,
            requiredQuestionCount: preset.questionCount,
          },
        })
      }

      const selectedQuestions = await this.selectQuestions(
        transaction,
        questionWhere,
        availableQuestionCount,
        preset.questionCount,
      )

      if (selectedQuestions.length !== preset.questionCount) {
        throw new ConflictException({
          error: {
            code: 'EXAM_QUESTIONS_UNAVAILABLE',
            message: 'The eligible question pool changed while the exam was starting',
          },
        })
      }
      const expiresAt = new Date(now.getTime() + preset.durationMinutes * 60_000)
      const session = await transaction.examSession.create({
        data: {
          userId: user.id,
          examSlug: preset.slug,
          questionCount: preset.questionCount,
          durationMinutes: preset.durationMinutes,
          startedAt: now,
          expiresAt,
          questions: {
            create: selectedQuestions.map(({ id: questionId }, index) => ({
              questionId,
              position: index + 1,
            })),
          },
        },
        select: { id: true, status: true, expiresAt: true },
      })

      return {
        sessionId: session.id,
        status: session.status,
        expiresAt: session.expiresAt.toISOString(),
        resumed: false,
      }
    })

    return { data }
  }

  async getSession(user: ExamUser, sessionId: string) {
    const session = await this.getOwnedSession(user, sessionId)
    return { data: this.formatSession(session) }
  }

  async saveAnswer(
    user: ExamUser,
    sessionId: string,
    questionId: string,
    input: SaveExamAnswerDto,
  ) {
    const session = await this.getOwnedSession(user, sessionId)
    this.ensureSessionInProgress(session)

    const sessionQuestion = session.questions.find((item) => item.questionId === questionId)
    if (!sessionQuestion) throw this.questionNotFound()

    const savedAt = new Date()
    const userAnswer = input.userAnswer.trim() ? input.userAnswer : null
    const updateResult = await this.prismaService.client.examSessionQuestion.updateMany({
      where: {
        sessionId,
        questionId,
        session: {
          is: {
            userId: user.id,
            status: ExamSessionStatus.in_progress,
            expiresAt: { gt: savedAt },
          },
        },
      },
      data: { userAnswer, savedAt },
    })

    if (updateResult.count === 0) {
      throw new ConflictException({
        error: {
          code: 'EXAM_SESSION_NOT_EDITABLE',
          message: 'This exam session no longer accepts answers',
        },
      })
    }

    return {
      data: {
        questionId,
        userAnswer,
        savedAt: savedAt.toISOString(),
      },
    }
  }

  async submit(user: ExamUser, sessionId: string) {
    const session = await this.getOwnedSession(user, sessionId)

    if (session.status !== ExamSessionStatus.in_progress) {
      return {
        data: {
          sessionId: session.id,
          status: session.status,
          submittedAt: session.submittedAt?.toISOString() ?? null,
        },
      }
    }

    const submittedAt = new Date()
    const status =
      session.expiresAt.getTime() <= submittedAt.getTime()
        ? ExamSessionStatus.expired
        : ExamSessionStatus.review
    const updated = await this.prismaService.client.examSession.update({
      where: { id: session.id },
      data: { status, submittedAt },
      select: { id: true, status: true, submittedAt: true },
    })

    return {
      data: {
        sessionId: updated.id,
        status: updated.status,
        submittedAt: updated.submittedAt?.toISOString() ?? null,
      },
    }
  }

  async submitAssessment(
    user: ExamUser,
    sessionId: string,
    questionId: string,
    input: SubmitExamAssessmentDto,
  ) {
    const session = await this.getOwnedSession(user, sessionId)
    this.ensureSessionReviewable(session)

    const sessionQuestion = session.questions.find((item) => item.questionId === questionId)
    if (!sessionQuestion) throw this.questionNotFound()

    const attempt = await this.prismaService.client.$transaction(async (transaction) => {
      const reviewableSessionCount = await transaction.examSession.count({
        where: {
          id: sessionId,
          userId: user.id,
          status: { in: [ExamSessionStatus.review, ExamSessionStatus.expired] },
        },
      })

      if (reviewableSessionCount === 0) {
        throw new ConflictException({
          error: {
            code: 'EXAM_SESSION_NOT_REVIEWABLE',
            message: 'This exam session no longer accepts assessments',
          },
        })
      }

      const createdAttempt = await transaction.attempt.create({
        data: {
          userId: user.id,
          questionId,
          userAnswer: sessionQuestion.userAnswer,
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

    this.ensureSessionReviewable(session)
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
        completedAt: new Date(),
      },
    })

    const completedSession = await this.getOwnedSession(user, sessionId)
    return { data: this.formatResult(completedSession) }
  }

  async getResult(user: ExamUser, sessionId: string) {
    const session = await this.getOwnedSession(user, sessionId)
    this.ensureSessionReviewable(session, true)
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
    let session = await this.prismaService.client.examSession.findFirst({
      where: { id: sessionId, userId: user.id },
      include: sessionInclude,
    })

    if (!session) throw this.sessionNotFound()

    const preset = this.requirePreset(session.examSlug)
    this.ensurePresetAccess(user, preset)

    if (
      session.status === ExamSessionStatus.in_progress &&
      session.expiresAt.getTime() <= Date.now()
    ) {
      session = await this.prismaService.client.examSession.update({
        where: { id: session.id },
        data: {
          status: ExamSessionStatus.expired,
          submittedAt: session.submittedAt ?? new Date(),
        },
        include: sessionInclude,
      })
    }

    return session
  }

  private formatSession(session: SessionWithQuestions) {
    const includeSolutions = session.status !== ExamSessionStatus.in_progress

    return {
      id: session.id,
      examSlug: session.examSlug,
      status: session.status,
      questionCount: session.questionCount,
      durationMinutes: session.durationMinutes,
      startedAt: session.startedAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
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
        userAnswer: sessionQuestion.userAnswer,
        savedAt: sessionQuestion.savedAt?.toISOString() ?? null,
        assessment: sessionQuestion.attempt?.assessment ?? null,
        ...(includeSolutions
          ? {
              answerText: sessionQuestion.question.answerText,
              explanation: sessionQuestion.question.explanation,
              codeSnippet: sessionQuestion.question.codeSnippet,
            }
          : {}),
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
        answered: session.questions.filter((question) => question.userAnswer !== null).length,
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

  private ensureSessionInProgress(session: SessionWithQuestions): void {
    if (session.status === ExamSessionStatus.in_progress) return

    throw new ConflictException({
      error: {
        code: 'EXAM_SESSION_NOT_EDITABLE',
        message: 'This exam session no longer accepts answers',
      },
    })
  }

  private ensureSessionReviewable(session: SessionWithQuestions, allowCompleted = false): void {
    const reviewableStatuses: ExamSessionStatus[] = [
      ExamSessionStatus.review,
      ExamSessionStatus.expired,
      ...(allowCompleted ? [ExamSessionStatus.completed] : []),
    ]

    if (reviewableStatuses.includes(session.status)) return

    throw new ConflictException({
      error: {
        code: 'EXAM_SESSION_NOT_REVIEWABLE',
        message: 'Submit the exam before reviewing its answers',
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
