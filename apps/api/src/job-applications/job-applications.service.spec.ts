import { NotFoundException } from '@nestjs/common'
import { JobApplicationStatus } from 'database'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PrismaService } from '../prisma/prisma.service'
import { CreateJobApplicationDto } from './dto/create-job-application.dto'
import {
  JobApplicationFollowUpFilter,
  JobApplicationSort,
  ListJobApplicationsDto,
} from './dto/list-job-applications.dto'
import { JobApplicationsService } from './job-applications.service'

const userId = '6ac9a588-2637-4527-a183-4ba6dde1da65'
const applicationId = '29a06c16-20ab-48c4-bd1c-4b67ef5d8551'
const technologyId = 'f42637cb-ab7b-428b-97b4-475f75404f28'
const timestamp = new Date('2026-08-06T10:00:00.000Z')

const application = {
  id: applicationId,
  userId,
  company: 'Acme',
  role: 'Engineer',
  location: null,
  salary: null,
  jobUrl: null,
  status: JobApplicationStatus.wishlist,
  note: null,
  customTechnologies: ['GraphQL'],
  appliedAt: null,
  followUpAt: null,
  createdAt: timestamp,
  updatedAt: timestamp,
  technologies: [
    {
      jobApplicationId: applicationId,
      technologyId,
      technology: { id: technologyId, name: 'TypeScript', slug: 'typescript' },
    },
  ],
}

describe('JobApplicationsService', () => {
  const findManyApplications = vi.fn()
  const countApplications = vi.fn()
  const groupApplications = vi.fn()
  const deleteApplications = vi.fn()
  const findManyEvents = vi.fn()
  const countEvents = vi.fn()
  const findManyTechnologies = vi.fn()
  const transaction = vi.fn()

  const prismaService = {
    client: {
      $transaction: transaction,
      jobApplication: {
        findMany: findManyApplications,
        count: countApplications,
        groupBy: groupApplications,
        deleteMany: deleteApplications,
      },
      jobApplicationStatusEvent: {
        findMany: findManyEvents,
        count: countEvents,
      },
      technology: {
        findMany: findManyTechnologies,
      },
    },
  } as unknown as PrismaService

  let service: JobApplicationsService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new JobApplicationsService(prismaService)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('scopes list data and statistics to the authenticated user', async () => {
    transaction.mockResolvedValueOnce([[application], 1])
    groupApplications.mockResolvedValueOnce([
      { status: JobApplicationStatus.wishlist, _count: { status: 1 } },
    ])

    const result = await service.findAll(
      userId,
      Object.assign(new ListJobApplicationsDto(), {
        search: 'Acme',
        status: JobApplicationStatus.wishlist,
        sort: JobApplicationSort.updatedDesc,
      }),
    )

    expect(findManyApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId, status: JobApplicationStatus.wishlist }),
      }),
    )
    expect(groupApplications).toHaveBeenCalledWith(expect.objectContaining({ where: { userId } }))
    expect(result.data[0]).toMatchObject({ id: applicationId, company: 'Acme' })
    expect(result.stats.wishlist).toBe(1)
    expect(result.stats.offer).toBe(0)
  })

  it.each([
    [JobApplicationFollowUpFilter.overdue, { lt: new Date('2026-08-11T00:00:00.000Z') }],
    [
      JobApplicationFollowUpFilter.today,
      {
        gte: new Date('2026-08-11T00:00:00.000Z'),
        lt: new Date('2026-08-12T00:00:00.000Z'),
      },
    ],
    [
      JobApplicationFollowUpFilter.next7Days,
      {
        gte: new Date('2026-08-12T00:00:00.000Z'),
        lt: new Date('2026-08-19T00:00:00.000Z'),
      },
    ],
    [JobApplicationFollowUpFilter.none, null],
  ])('filters active applications by %s follow-up dates', async (followUp, followUpAt) => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-11T14:30:00.000Z'))
    transaction.mockResolvedValueOnce([[application], 1])
    groupApplications.mockResolvedValueOnce([])

    await service.findAll(
      userId,
      Object.assign(new ListJobApplicationsDto(), {
        followUp,
      }),
    )

    expect(findManyApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId,
          AND: [
            {
              status: {
                notIn: [JobApplicationStatus.offer, JobApplicationStatus.rejected],
              },
              followUpAt,
            },
          ],
        },
      }),
    )
  })

  it('combines follow-up, status, and search filters within the user scope', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-11T14:30:00.000Z'))
    transaction.mockResolvedValueOnce([[application], 1])
    groupApplications.mockResolvedValueOnce([])

    await service.findAll(
      userId,
      Object.assign(new ListJobApplicationsDto(), {
        search: 'Acme',
        status: JobApplicationStatus.technical,
        followUp: JobApplicationFollowUpFilter.today,
      }),
    )

    expect(findManyApplications).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId,
          status: JobApplicationStatus.technical,
          OR: expect.arrayContaining([
            { company: { contains: 'Acme', mode: 'insensitive' } },
            { role: { contains: 'Acme', mode: 'insensitive' } },
          ]),
          AND: [
            {
              status: {
                notIn: [JobApplicationStatus.offer, JobApplicationStatus.rejected],
              },
              followUpAt: {
                gte: new Date('2026-08-11T00:00:00.000Z'),
                lt: new Date('2026-08-12T00:00:00.000Z'),
              },
            },
          ],
        }),
      }),
    )
  })

  it('creates an initial status event and validates catalog technologies', async () => {
    const tx = {
      technology: { findMany: vi.fn().mockResolvedValue([{ id: technologyId }]) },
      jobApplication: { create: vi.fn().mockResolvedValue(application) },
    }
    transaction.mockImplementationOnce((callback) => callback(tx))

    await service.create(
      userId,
      Object.assign(new CreateJobApplicationDto(), {
        company: 'Acme',
        role: 'Engineer',
        technologyIds: [technologyId],
        customTechnologies: [' GraphQL ', 'graphql'],
      }),
    )

    expect(tx.jobApplication.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId,
          customTechnologies: ['GraphQL'],
          statusEvents: {
            create: { fromStatus: null, toStatus: JobApplicationStatus.wishlist },
          },
        }),
      }),
    )
  })

  it('records a real status transition and automatically sets appliedAt', async () => {
    const update = vi.fn().mockResolvedValue(undefined)
    const createEvent = vi.fn().mockResolvedValue(undefined)
    const tx = {
      jobApplication: {
        findFirst: vi.fn().mockResolvedValue(application),
        update,
        findUniqueOrThrow: vi.fn().mockResolvedValue({
          ...application,
          status: JobApplicationStatus.applied,
          appliedAt: timestamp,
        }),
      },
      jobApplicationTechnology: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      jobApplicationStatusEvent: { create: createEvent },
      technology: { findMany: vi.fn() },
    }
    transaction.mockImplementationOnce((callback) => callback(tx))

    await service.update(userId, applicationId, { status: JobApplicationStatus.applied })

    expect(update).toHaveBeenCalledWith({
      where: { id: applicationId },
      data: expect.objectContaining({
        status: JobApplicationStatus.applied,
        appliedAt: expect.any(Date),
      }),
    })
    expect(createEvent).toHaveBeenCalledWith({
      data: {
        jobApplicationId: applicationId,
        fromStatus: JobApplicationStatus.wishlist,
        toStatus: JobApplicationStatus.applied,
      },
    })
  })

  it('does not create a duplicate event when status is unchanged', async () => {
    const createEvent = vi.fn()
    const tx = {
      jobApplication: {
        findFirst: vi.fn().mockResolvedValue(application),
        update: vi.fn(),
        findUniqueOrThrow: vi.fn().mockResolvedValue(application),
      },
      jobApplicationTechnology: {
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      jobApplicationStatusEvent: { create: createEvent },
      technology: { findMany: vi.fn() },
    }
    transaction.mockImplementationOnce((callback) => callback(tx))

    await service.update(userId, applicationId, { status: JobApplicationStatus.wishlist })
    expect(createEvent).not.toHaveBeenCalled()
  })

  it('returns 404 instead of deleting another user application', async () => {
    deleteApplications.mockResolvedValueOnce({ count: 0 })

    await expect(service.remove(userId, applicationId)).rejects.toBeInstanceOf(NotFoundException)
    expect(deleteApplications).toHaveBeenCalledWith({ where: { id: applicationId, userId } })
  })

  it('scopes status history through the parent application owner', async () => {
    transaction.mockResolvedValueOnce([
      [
        {
          id: 'event-id',
          fromStatus: null,
          toStatus: JobApplicationStatus.wishlist,
          createdAt: timestamp,
        },
      ],
      1,
    ])

    const result = await service.findStatusEvents(userId, applicationId, {
      page: 1,
      limit: 20,
    })

    expect(findManyEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          jobApplication: {
            is: { id: applicationId, userId },
          },
        },
      }),
    )
    expect(result.data[0]?.createdAt).toBe(timestamp.toISOString())
  })
})
