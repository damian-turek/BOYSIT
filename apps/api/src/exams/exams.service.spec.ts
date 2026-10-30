import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { AccessLevel, Assessment, ExamSessionStatus, UserPlan } from 'database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { EXAM_PRESETS, FREE_PREVIEW_CARD_COUNT } from './exam-presets'
import { ExamsService } from './exams.service'

const userId = '6ac9a588-2637-4527-a183-4ba6dde1da65'
const otherUserId = '4c743ccb-89d7-4a7f-aa4f-270272713a67'
const sessionId = '29a06c16-20ab-48c4-bd1c-4b67ef5d8551'
const questionId = 'f42637cb-ab7b-428b-97b4-475f75404f28'
const now = new Date('2026-09-16T10:00:00.000Z')

const freeUser = { id: userId, plan: UserPlan.free }
const proUser = { id: userId, plan: UserPlan.pro }

const createSession = (
  status: ExamSessionStatus = ExamSessionStatus.in_progress,
  overrides: Record<string, unknown> = {},
) => ({
  id: sessionId,
  userId,
  examSlug: 'frontend-basics',
  status,
  questionCount: 1,
  durationMinutes: null,
  startedAt: now,
  expiresAt: null,
  submittedAt: status === ExamSessionStatus.completed ? now : null,
  completedAt: status === ExamSessionStatus.completed ? now : null,
  createdAt: now,
  updatedAt: now,
  questions: [
    {
      sessionId,
      questionId,
      attemptId: null,
      position: 1,
      userAnswer: null,
      savedAt: null,
      attempt: null as { id: string; assessment: Assessment | null } | null,
      question: {
        id: questionId,
        accessLevel: AccessLevel.free,
        isActive: true,
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
  const countQuestions = vi.fn()
  const findManyQuestions = vi.fn()
  const updateSessionQuestion = vi.fn()
  const createAttempt = vi.fn()
  const transaction = vi.fn()

  const transactionClient = {
    examSession: {
      count: countSessions,
      findFirst: findFirstSession,
      create: createSessionRecord,
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
      question: {
        count: countQuestions,
      },
    },
  } as unknown as PrismaService

  let service: ExamsService

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(now)
    transaction.mockImplementation((callback) => callback(transactionClient))
    findManySessions.mockResolvedValue([])
    countQuestions.mockResolvedValue(100)
    countSessions.mockResolvedValue(1)
    updateSessionQuestion.mockResolvedValue({})
    service = new ExamsService(prismaService)
  })

  it('returns one Free Frontend deck and locks Pro topics for a Free user', async () => {
    const result = await service.getCatalog(freeUser)
    const freeExams = result.data.filter((exam) => exam.access === AccessLevel.free)
    const proExam = result.data.find((exam) => exam.slug === 'javascript')

    expect(result.data).toHaveLength(EXAM_PRESETS.length)
    expect(freeExams).toEqual([
      expect.objectContaining({
        slug: 'frontend-basics',
        questionCountOptions: [FREE_PREVIEW_CARD_COUNT],
        availableQuestionCountOptions: [FREE_PREVIEW_CARD_COUNT],
        canStart: true,
        lockReason: null,
      }),
    ])
    expect(proExam).toMatchObject({
      access: AccessLevel.pro,
      canStart: false,
      lockReason: 'pro_required',
      questionCountOptions: [20, 30, 50],
    })
  })

  it('exposes only Pro deck sizes supported by the current topic pool', async () => {
    countQuestions.mockResolvedValue(35)

    const result = await service.getCatalog(proUser)
    const javascriptExam = result.data.find((exam) => exam.slug === 'javascript')

    expect(javascriptExam?.availableQuestionCountOptions).toEqual([20, 30])
  })

  it('allows a topic to start when its pool is smaller than the minimum deck size', async () => {
    countQuestions.mockResolvedValue(7)

    const result = await service.getCatalog(proUser)
    const javascriptExam = result.data.find((exam) => exam.slug === 'javascript')

    expect(javascriptExam).toMatchObject({
      availableQuestionCountOptions: [20],
      canStart: true,
      lockReason: null,
    })
  })

  it('counts only active, verified Free questions for the Free deck', async () => {
    await service.getCatalog(freeUser)

    expect(countQuestions).toHaveBeenCalledWith({
      where: expect.objectContaining({
        isActive: true,
        verified: true,
        accessLevel: { in: [AccessLevel.free] },
      }),
    })
  })

  it('rejects direct Free-user access to a Pro topic before accessing the database', async () => {
    await expect(
      service.startSession(freeUser, 'javascript', { questionCount: 20 }),
    ).rejects.toBeInstanceOf(ForbiddenException)
    expect(transaction).not.toHaveBeenCalled()
  })

  it('uses the same oldest 20 eligible questions for every Free session', async () => {
    findFirstSession.mockResolvedValueOnce(null)
    countQuestions.mockResolvedValueOnce(40)
    findManyQuestions.mockResolvedValueOnce(
      Array.from({ length: FREE_PREVIEW_CARD_COUNT }, (_, index) => ({ id: `question-${index}` })),
    )
    createSessionRecord.mockResolvedValueOnce({
      id: sessionId,
      status: ExamSessionStatus.in_progress,
    })

    const result = await service.startSession(freeUser, 'frontend-basics', { questionCount: 50 })
    const createInput = createSessionRecord.mock.calls[0]?.[0]

    expect(findManyQuestions).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        take: FREE_PREVIEW_CARD_COUNT,
      }),
    )
    expect(createInput.data.questionCount).toBe(FREE_PREVIEW_CARD_COUNT)
    expect(createInput.data.durationMinutes).toBeNull()
    expect(createInput.data.expiresAt).toBeNull()
    expect(result.data).toEqual({
      sessionId,
      status: ExamSessionStatus.in_progress,
      resumed: false,
    })
  })

  it('starts a Pro session with the selected deck size', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    findFirstSession.mockResolvedValueOnce(null)
    countQuestions.mockResolvedValueOnce(60)
    findManyQuestions.mockResolvedValueOnce(
      Array.from({ length: 30 }, (_, index) => ({ id: `question-${index}` })),
    )
    createSessionRecord.mockResolvedValueOnce({
      id: sessionId,
      status: ExamSessionStatus.in_progress,
    })

    await service.startSession(proUser, 'javascript', { questionCount: 30 })

    expect(createSessionRecord.mock.calls[0]?.[0].data.questionCount).toBe(30)
    expect(createSessionRecord.mock.calls[0]?.[0].data.questions.create).toHaveLength(30)
  })

  it('rejects a Pro deck size outside the preset options', async () => {
    await expect(
      service.startSession(proUser, 'javascript', { questionCount: 25 }),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(transaction).not.toHaveBeenCalled()
  })

  it('resumes an unfinished session instead of creating a duplicate', async () => {
    findFirstSession.mockResolvedValueOnce({ id: sessionId, status: ExamSessionStatus.in_progress })

    const result = await service.startSession(freeUser, 'frontend-basics')

    expect(result.data.resumed).toBe(true)
    expect(createSessionRecord).not.toHaveBeenCalled()
  })

  it('starts with every available card when the pool has fewer than 20 cards', async () => {
    findFirstSession.mockResolvedValueOnce(null)
    countQuestions.mockResolvedValueOnce(19)
    findManyQuestions.mockResolvedValueOnce(
      Array.from({ length: 19 }, (_, index) => ({ id: `question-${index}` })),
    )
    createSessionRecord.mockResolvedValueOnce({
      id: sessionId,
      status: ExamSessionStatus.in_progress,
    })

    await service.startSession(freeUser, 'frontend-basics')

    expect(createSessionRecord.mock.calls[0]?.[0].data.questionCount).toBe(19)
    expect(createSessionRecord.mock.calls[0]?.[0].data.questions.create).toHaveLength(19)
  })

  it('returns a controlled conflict only when the eligible pool is empty', async () => {
    findFirstSession.mockResolvedValueOnce(null)
    countQuestions.mockResolvedValueOnce(0)

    await expect(service.startSession(freeUser, 'frontend-basics')).rejects.toMatchObject({
      status: 409,
      response: { error: expect.objectContaining({ code: 'EXAM_QUESTIONS_UNAVAILABLE' }) },
    })
  })

  it('returns the answer side while a flashcard session is active', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    const result = await service.getSession(freeUser, sessionId)

    expect(result.data).toMatchObject({ access: AccessLevel.free })
    expect(result.data.questions[0]).toMatchObject({
      answerText: 'A function with access to its lexical scope.',
      explanation: 'The referenced scope survives after the outer function returns.',
      codeSnippet: 'function outer() {}',
    })
  })

  it('does not reveal whether a session owned by another user exists', async () => {
    findFirstSession.mockResolvedValueOnce(null)

    await expect(
      service.getSession({ id: otherUserId, plan: UserPlan.free }, sessionId),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('does not reveal a previously Free session card after it becomes Pro', async () => {
    const session = createSession()
    findFirstSession.mockResolvedValueOnce({
      ...session,
      questions: session.questions.map((item) => ({
        ...item,
        question: { ...item.question, accessLevel: AccessLevel.pro },
      })),
    })

    await expect(service.getSession(freeUser, sessionId)).rejects.toBeInstanceOf(NotFoundException)
  })

  it('creates an assessment Attempt without a typed answer and links it to the card', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())
    createAttempt.mockResolvedValueOnce({
      id: 'attempt-id',
      assessment: Assessment.know,
      createdAt: now,
    })

    const result = await service.submitAssessment(freeUser, sessionId, questionId, {
      assessment: Assessment.know,
    })

    expect(createAttempt).toHaveBeenCalledWith({
      data: { userId, questionId, userAnswer: null, assessment: Assessment.know },
      select: { id: true, assessment: true, createdAt: true },
    })
    expect(updateSessionQuestion).toHaveBeenCalledWith({
      where: { sessionId_questionId: { sessionId, questionId } },
      data: { attemptId: 'attempt-id' },
    })
    expect(result.data.assessment).toBe(Assessment.know)
  })

  it('requires every card to be assessed before completion', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    await expect(service.completeReview(freeUser, sessionId)).rejects.toBeInstanceOf(
      ConflictException,
    )
    expect(updateSession).not.toHaveBeenCalled()
  })

  it('completes a fully assessed session and returns its result', async () => {
    const assessedSession = createSession()
    assessedSession.questions[0]!.attempt = { id: 'attempt-id', assessment: Assessment.know }
    const completedSession = createSession(ExamSessionStatus.completed)
    completedSession.questions[0]!.attempt = { id: 'attempt-id', assessment: Assessment.know }
    findFirstSession.mockResolvedValueOnce(assessedSession).mockResolvedValueOnce(completedSession)
    updateSession.mockResolvedValueOnce({})

    const result = await service.completeReview(freeUser, sessionId)

    expect(updateSession).toHaveBeenCalledWith({
      where: { id: sessionId },
      data: { status: ExamSessionStatus.completed, submittedAt: now, completedAt: now },
    })
    expect(result.data.summary.know).toBe(1)
  })

  it('blocks result access until the flashcard session is complete', async () => {
    findFirstSession.mockResolvedValueOnce(createSession())

    await expect(service.getResult(freeUser, sessionId)).rejects.toMatchObject({
      status: 409,
      response: { error: expect.objectContaining({ code: 'EXAM_SESSION_NOT_COMPLETED' }) },
    })
  })

  it('returns assessment counts without inventing an automatic score', async () => {
    const completedSession = createSession(ExamSessionStatus.completed)
    completedSession.questions[0]!.attempt = { id: 'attempt-id', assessment: Assessment.partial }
    findFirstSession.mockResolvedValueOnce(completedSession)

    const result = await service.getResult(freeUser, sessionId)

    expect(result.data.summary).toEqual({
      total: 1,
      assessed: 1,
      know: 0,
      partial: 1,
      dontKnow: 0,
    })
    expect(result.data.summary).not.toHaveProperty('score')
  })
})
