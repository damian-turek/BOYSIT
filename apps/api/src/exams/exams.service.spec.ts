import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { AccessLevel, Assessment, ExamSessionStatus, UserPlan } from 'database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { EXAM_PRESETS } from './exam-presets'
import { ExamsService } from './exams.service'

const userId = '6ac9a588-2637-4527-a183-4ba6dde1da65'
const otherUserId = '4c743ccb-89d7-4a7f-aa4f-270272713a67'
const sessionId = '29a06c16-20ab-48c4-bd1c-4b67ef5d8551'
const questionId = 'f42637cb-ab7b-428b-97b4-475f75404f28'
const now = new Date('2026-08-12T10:00:00.000Z')

const freeUser = { id: userId, plan: UserPlan.free }
const proUser = { id: userId, plan: UserPlan.pro }

const createSession = (
  status: ExamSessionStatus = ExamSessionStatus.in_progress,
  overrides: Record<string, unknown> = {},
) => ({
  id: sessionId,
  userId,
  examSlug: 'warmup',
  status,
  questionCount: 1,
  durationMinutes: 10,
  startedAt: now,
  expiresAt: new Date('2026-08-12T10:10:00.000Z'),
  submittedAt: status === ExamSessionStatus.in_progress ? null : now,
  completedAt: status === ExamSessionStatus.completed ? now : null,
  createdAt: now,
  updatedAt: now,
  questions: [
    {
      sessionId,
      questionId,
      attemptId: null,
      position: 1,
      userAnswer: 'A closure retains its lexical environment.',
      savedAt: now,
      attempt: null as { id: string; assessment: Assessment | null } | null,
      question: {
        id: questionId,
        title: 'Explain closures',
        questionText: 'What is a closure?',
        answerText: 'A function with access to its lexical scope.',
        explanation: 'The referenced scope survives after the outer function returns.',
        codeSnippet: 'function outer() {}',
        difficulty: 'junior',
        questionType: 'theory',
        category: { id: 'category-id', name: 'Frontend', slug: 'frontend' },
        technology: { id: 'technology-id', name: 'JavaScript', slug: 'javascript' },
      },
    },
  ],
  ...overrides,
})

describe('ExamsService', () => {
  const findManySessions = vi.fn()
  const findFirstSession = vi.fn()
  const countSessions = vi.fn()
  const createSessionRecord = vi.fn()
  const updateSession = vi.fn()
  const updateManySessions = vi.fn()
  const countQuestions = vi.fn()
  const findManyQuestions = vi.fn()
  const updateManySessionQuestions = vi.fn()
  const updateSessionQuestion = vi.fn()
  const createAttempt = vi.fn()
  const transaction = vi.fn()

  const transactionClient = {
    examSession: {
      count: countSessions,
      findFirst: findFirstSession,
      create: createSessionRecord,
      updateMany: updateManySessions,
    },
    examSessionQuestion: {
      update: updateSessionQuestion,
    },
    question: {
      count: countQuestions,
      findMany: findManyQuestions,
    },
    attempt: {
      create: createAttempt,
    },
  }

  const prismaService = {
    client: {
      $transaction: transaction,
      examSession: {
        findMany: findManySessions,
        findFirst: findFirstSession,
        update: updateSession,
      },
      examSessionQuestion: {
        updateMany: updateManySessionQuestions,
      },
      question: {
        count: countQuestions,
      },
    },
  } as unknown as PrismaService

  let service: ExamsService

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(now)
    transaction.mockImplementation((callback) => callback(transactionClient))
    findManySessions.mockResolvedValue([])
    countQuestions.mockResolvedValue(100)
    countSessions.mockResolvedValue(1)
    updateManySessions.mockResolvedValue({ count: 0 })
    updateManySessionQuestions.mockResolvedValue({ count: 1 })
    updateSessionQuestion.mockResolvedValue({})
    service = new ExamsService(prismaService)
  })

  it('returns server-owned catalogue access and locks Pro exams for a Free user', async () => {
    const result = await service.getCatalog(freeUser)
    const freeExam = result.data.find((exam) => exam.slug === 'warmup')
    const proExam = result.data.find((exam) => exam.slug === 'javascript')

    expect(result.data).toHaveLength(EXAM_PRESETS.length)
    expect(freeExam).toMatchObject({
      access: AccessLevel.free,
      canStart: true,
      lockReason: null,
    })
    expect(proExam).toMatchObject({
      access: AccessLevel.pro,
      canStart: false,
      lockReason: 'pro_required',
    })
  })

  it('counts only active, verified Free questions for a Free preset', async () => {
    await service.getCatalog(freeUser)

    expect(countQuestions).toHaveBeenCalledWith({
      where: expect.objectContaining({
        isActive: true,
        verified: true,
        accessLevel: { in: [AccessLevel.free] },
      }),
    })
  })

  it('rejects a direct Free-user request for a Pro exam before accessing the database', async () => {
    await expect(service.startSession(freeUser, 'javascript')).rejects.toBeInstanceOf(
      ForbiddenException,
    )
    expect(transaction).not.toHaveBeenCalled()
  })

  it('starts a Free session with a stable question order and server expiry', async () => {
    findFirstSession.mockResolvedValueOnce(null)
    countQuestions.mockResolvedValueOnce(8)
    findManyQuestions.mockResolvedValueOnce(
      Array.from({ length: 8 }, (_, index) => ({ id: `question-${index}` })),
    )
    createSessionRecord.mockResolvedValueOnce({
      id: sessionId,
      status: ExamSessionStatus.in_progress,
      expiresAt: new Date('2026-08-12T10:10:00.000Z'),
    })

    const result = await service.startSession(freeUser, 'warmup')
    const createInput = createSessionRecord.mock.calls[0]?.[0]

    expect(result.data).toEqual({
      sessionId,
      status: ExamSessionStatus.in_progress,
      expiresAt: '2026-08-12T10:10:00.000Z',
      resumed: false,
    })
    expect(createInput.data.questions.create).toHaveLength(8)
    expect(
      createInput.data.questions.create.map((question: { position: number }) => question.position),
    ).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('resumes an existing unexpired session instead of creating a duplicate', async () => {
    findFirstSession.mockResolvedValueOnce({
      id: sessionId,
      status: ExamSessionStatus.in_progress,
      expiresAt: new Date('2026-08-12T10:10:00.000Z'),
    })

    const result = await service.startSession(freeUser, 'warmup')

    expect(result.data.resumed).toBe(true)
    expect(createSessionRecord).not.toHaveBeenCalled()
  })

  it('returns a controlled conflict when the eligible question pool is too small', async () => {
    findFirstSession.mockResolvedValueOnce(null)
    countQuestions.mockResolvedValueOnce(7)

    await expect(service.startSession(freeUser, 'warmup')).rejects.toMatchObject({
      status: 409,
      response: {
        error: expect.objectContaining({ code: 'EXAM_QUESTIONS_UNAVAILABLE' }),
      },
    })
  })

  it('does not expose protected answer fields while a session is active', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    const result = await service.getSession(freeUser, sessionId)

    expect(result.data.questions[0]).not.toHaveProperty('answerText')
    expect(result.data.questions[0]).not.toHaveProperty('explanation')
    expect(result.data.questions[0]).not.toHaveProperty('codeSnippet')
  })

  it('reveals solutions only after the session enters review', async () => {
    findFirstSession.mockResolvedValueOnce(createSession(ExamSessionStatus.review))

    const result = await service.getSession(freeUser, sessionId)

    expect(result.data.questions[0]).toMatchObject({
      answerText: 'A function with access to its lexical scope.',
      explanation: 'The referenced scope survives after the outer function returns.',
      codeSnippet: 'function outer() {}',
    })
  })

  it('marks an expired session before returning it and then reveals review data', async () => {
    const activeExpiredSession = createSession(ExamSessionStatus.in_progress, {
      expiresAt: new Date('2026-08-12T09:59:00.000Z'),
    })
    const expiredSession = createSession(ExamSessionStatus.expired, {
      expiresAt: new Date('2026-08-12T09:59:00.000Z'),
    })
    findFirstSession.mockResolvedValueOnce(activeExpiredSession)
    updateSession.mockResolvedValueOnce(expiredSession)

    const result = await service.getSession(freeUser, sessionId)

    expect(updateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: ExamSessionStatus.expired }),
      }),
    )
    expect(result.data.status).toBe(ExamSessionStatus.expired)
    expect(result.data.questions[0]).toHaveProperty('answerText')
  })

  it('does not reveal whether a session owned by another user exists', async () => {
    findFirstSession.mockResolvedValueOnce(null)

    await expect(
      service.getSession({ id: otherUserId, plan: UserPlan.free }, sessionId),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('saves an answer only through an owned active and unexpired session', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    const result = await service.saveAnswer(freeUser, sessionId, questionId, {
      userAnswer: 'My answer',
    })

    expect(updateManySessionQuestions).toHaveBeenCalledWith({
      where: expect.objectContaining({
        sessionId,
        questionId,
        session: {
          is: expect.objectContaining({
            userId,
            status: ExamSessionStatus.in_progress,
            expiresAt: { gt: now },
          }),
        },
      }),
      data: { userAnswer: 'My answer', savedAt: now },
    })
    expect(result.data.savedAt).toBe(now.toISOString())
  })

  it('rejects an answer when the session expires during the save request', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())
    updateManySessionQuestions.mockResolvedValueOnce({ count: 0 })

    await expect(
      service.saveAnswer(freeUser, sessionId, questionId, { userAnswer: 'Too late' }),
    ).rejects.toMatchObject({
      status: 409,
      response: {
        error: expect.objectContaining({ code: 'EXAM_SESSION_NOT_EDITABLE' }),
      },
    })
  })

  it('rejects a question that is not part of the session', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    await expect(
      service.saveAnswer(freeUser, sessionId, 'other-question', { userAnswer: 'Nope' }),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(updateManySessionQuestions).not.toHaveBeenCalled()
  })

  it('submits an active session once and keeps repeat submissions idempotent', async () => {
    findFirstSession
      .mockResolvedValueOnce(createSession())
      .mockResolvedValueOnce(createSession(ExamSessionStatus.review))
    updateSession.mockResolvedValueOnce({
      id: sessionId,
      status: ExamSessionStatus.review,
      submittedAt: now,
    })

    const first = await service.submit(freeUser, sessionId)
    const second = await service.submit(freeUser, sessionId)

    expect(first.data.status).toBe(ExamSessionStatus.review)
    expect(second.data.status).toBe(ExamSessionStatus.review)
    expect(updateSession).toHaveBeenCalledTimes(1)
  })

  it('creates an Attempt and links the latest assessment to the session question', async () => {
    findFirstSession.mockResolvedValueOnce(createSession(ExamSessionStatus.review))
    createAttempt.mockResolvedValueOnce({
      id: 'attempt-id',
      assessment: Assessment.know,
      createdAt: now,
    })

    const result = await service.submitAssessment(freeUser, sessionId, questionId, {
      assessment: Assessment.know,
    })

    expect(createAttempt).toHaveBeenCalledWith({
      data: {
        userId,
        questionId,
        userAnswer: 'A closure retains its lexical environment.',
        assessment: Assessment.know,
      },
      select: { id: true, assessment: true, createdAt: true },
    })
    expect(updateSessionQuestion).toHaveBeenCalledWith({
      where: { sessionId_questionId: { sessionId, questionId } },
      data: { attemptId: 'attempt-id' },
    })
    expect(result.data.assessment).toBe(Assessment.know)
  })

  it('requires every question to be assessed before completing review', async () => {
    findFirstSession.mockResolvedValueOnce(createSession(ExamSessionStatus.review))

    await expect(service.completeReview(freeUser, sessionId)).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect(updateSession).not.toHaveBeenCalled()
  })

  it('completes a fully assessed review and preserves its result', async () => {
    const assessedReview = createSession(ExamSessionStatus.review)
    assessedReview.questions[0]!.attempt = {
      id: 'attempt-id',
      assessment: Assessment.know,
    }
    const completedReview = createSession(ExamSessionStatus.completed)
    completedReview.questions[0]!.attempt = {
      id: 'attempt-id',
      assessment: Assessment.know,
    }
    findFirstSession.mockResolvedValueOnce(assessedReview).mockResolvedValueOnce(completedReview)
    updateSession.mockResolvedValueOnce({})

    const result = await service.completeReview(freeUser, sessionId)

    expect(updateSession).toHaveBeenCalledWith({
      where: { id: sessionId },
      data: {
        status: ExamSessionStatus.completed,
        completedAt: now,
      },
    })
    expect(result.data.status).toBe(ExamSessionStatus.completed)
    expect(result.data.summary.know).toBe(1)
  })

  it('blocks result access until the exam is submitted', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    await expect(service.getResult(freeUser, sessionId)).rejects.toMatchObject({
      status: 409,
      response: {
        error: expect.objectContaining({ code: 'EXAM_SESSION_NOT_REVIEWABLE' }),
      },
    })
  })

  it('returns assessment counts without inventing an automatic score', async () => {
    const assessedSession = createSession(ExamSessionStatus.completed)
    assessedSession.questions[0]!.attempt = {
      id: 'attempt-id',
      assessment: Assessment.partial,
    }
    findFirstSession.mockResolvedValueOnce(assessedSession)

    const result = await service.getResult(proUser, sessionId)

    expect(result.data.summary).toEqual({
      total: 1,
      answered: 1,
      assessed: 1,
      know: 0,
      partial: 1,
      dontKnow: 0,
    })
    expect(result.data.summary).not.toHaveProperty('score')
  })
})
