import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { JobApplicationStatus, Prisma } from 'database'

import { PrismaService } from '../prisma/prisma.service'
import { CreateJobApplicationDto } from './dto/create-job-application.dto'
import {
  JobApplicationFollowUpFilter,
  JobApplicationSort,
  ListJobApplicationsDto,
  ListStatusEventsDto,
} from './dto/list-job-applications.dto'
import { UpdateJobApplicationDto } from './dto/update-job-application.dto'

const jobApplicationInclude = {
  technologies: {
    include: {
      technology: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
} satisfies Prisma.JobApplicationInclude

type JobApplicationWithTechnologies = Prisma.JobApplicationGetPayload<{
  include: typeof jobApplicationInclude
}>

@Injectable()
export class JobApplicationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(userId: string, query: ListJobApplicationsDto) {
    const where: Prisma.JobApplicationWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.followUp ? { AND: [this.getFollowUpWhere(query.followUp)] } : {}),
      ...(query.search
        ? {
            OR: [
              { company: { contains: query.search, mode: 'insensitive' as const } },
              { role: { contains: query.search, mode: 'insensitive' as const } },
              { location: { contains: query.search, mode: 'insensitive' as const } },
              { note: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }
    const skip = (query.page - 1) * query.limit

    const [applications, total] = await this.prismaService.client.$transaction([
      this.prismaService.client.jobApplication.findMany({
        where,
        include: jobApplicationInclude,
        orderBy: this.getOrderBy(query.sort),
        skip,
        take: query.limit,
      }),
      this.prismaService.client.jobApplication.count({ where }),
    ])
    const statusGroups = await this.prismaService.client.jobApplication.groupBy({
      by: ['status'],
      where: { userId },
      orderBy: { status: 'asc' },
      _count: { status: true },
    })

    const stats = Object.values(JobApplicationStatus).reduce<Record<JobApplicationStatus, number>>(
      (counts, status) => {
        counts[status] = 0
        return counts
      },
      {} as Record<JobApplicationStatus, number>,
    )

    for (const group of statusGroups) {
      stats[group.status] = group._count.status
    }

    return {
      data: applications.map((application) => this.formatApplication(application)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
      stats,
    }
  }

  async findTechnologyOptions() {
    const technologies = await this.prismaService.client.technology.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    return { data: technologies }
  }

  async create(userId: string, input: CreateJobApplicationDto) {
    const application = await this.prismaService.client.$transaction(async (transaction) => {
      const technologyIds = await this.validateTechnologyIds(transaction, input.technologyIds)
      const status = input.status ?? JobApplicationStatus.wishlist
      const appliedAt =
        input.appliedAt === undefined && status !== JobApplicationStatus.wishlist
          ? new Date()
          : this.parseDate(input.appliedAt)

      return transaction.jobApplication.create({
        data: {
          userId,
          company: input.company,
          role: input.role,
          location: this.nullableText(input.location),
          salary: this.nullableText(input.salary),
          jobUrl: this.nullableText(input.jobUrl),
          status,
          note: this.nullableText(input.note),
          appliedAt,
          followUpAt: this.parseDate(input.followUpAt),
          customTechnologies: this.normalizeCustomTechnologies(input.customTechnologies),
          technologies: technologyIds.length
            ? {
                create: technologyIds.map((technologyId) => ({
                  technology: { connect: { id: technologyId } },
                })),
              }
            : undefined,
          statusEvents: {
            create: {
              fromStatus: null,
              toStatus: status,
            },
          },
        },
        include: jobApplicationInclude,
      })
    })

    return { data: this.formatApplication(application) }
  }

  async update(userId: string, applicationId: string, input: UpdateJobApplicationDto) {
    const application = await this.prismaService.client.$transaction(async (transaction) => {
      const existing = await transaction.jobApplication.findFirst({
        where: { id: applicationId, userId },
      })

      if (!existing) {
        throw this.notFound()
      }

      const technologyIds =
        input.technologyIds === undefined
          ? undefined
          : await this.validateTechnologyIds(transaction, input.technologyIds)
      const nextStatus = input.status ?? existing.status
      const shouldSetAppliedAt =
        input.appliedAt === undefined &&
        existing.appliedAt === null &&
        existing.status === JobApplicationStatus.wishlist &&
        nextStatus !== JobApplicationStatus.wishlist

      const data: Prisma.JobApplicationUpdateInput = {
        ...(input.company !== undefined ? { company: input.company } : {}),
        ...(input.role !== undefined ? { role: input.role } : {}),
        ...(input.location !== undefined ? { location: this.nullableText(input.location) } : {}),
        ...(input.salary !== undefined ? { salary: this.nullableText(input.salary) } : {}),
        ...(input.jobUrl !== undefined ? { jobUrl: this.nullableText(input.jobUrl) } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.note !== undefined ? { note: this.nullableText(input.note) } : {}),
        ...(input.appliedAt !== undefined
          ? { appliedAt: this.parseDate(input.appliedAt) }
          : shouldSetAppliedAt
            ? { appliedAt: new Date() }
            : {}),
        ...(input.followUpAt !== undefined ? { followUpAt: this.parseDate(input.followUpAt) } : {}),
        ...(input.customTechnologies !== undefined
          ? { customTechnologies: this.normalizeCustomTechnologies(input.customTechnologies) }
          : {}),
      }

      await transaction.jobApplication.update({
        where: { id: existing.id },
        data,
      })

      if (technologyIds !== undefined) {
        await transaction.jobApplicationTechnology.deleteMany({
          where: { jobApplicationId: existing.id },
        })

        if (technologyIds.length) {
          await transaction.jobApplicationTechnology.createMany({
            data: technologyIds.map((technologyId) => ({
              jobApplicationId: existing.id,
              technologyId,
            })),
            skipDuplicates: true,
          })
        }
      }

      if (nextStatus !== existing.status) {
        await transaction.jobApplicationStatusEvent.create({
          data: {
            jobApplicationId: existing.id,
            fromStatus: existing.status,
            toStatus: nextStatus,
          },
        })
      }

      return transaction.jobApplication.findUniqueOrThrow({
        where: { id: existing.id },
        include: jobApplicationInclude,
      })
    })

    return { data: this.formatApplication(application) }
  }

  async remove(userId: string, applicationId: string): Promise<void> {
    const result = await this.prismaService.client.jobApplication.deleteMany({
      where: { id: applicationId, userId },
    })

    if (result.count === 0) {
      throw this.notFound()
    }
  }

  async findStatusEvents(userId: string, applicationId: string, query: ListStatusEventsDto) {
    const where: Prisma.JobApplicationStatusEventWhereInput = {
      jobApplication: {
        is: {
          id: applicationId,
          userId,
        },
      },
    }
    const skip = (query.page - 1) * query.limit
    const [events, total] = await this.prismaService.client.$transaction([
      this.prismaService.client.jobApplicationStatusEvent.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: query.limit,
        select: {
          id: true,
          fromStatus: true,
          toStatus: true,
          createdAt: true,
        },
      }),
      this.prismaService.client.jobApplicationStatusEvent.count({ where }),
    ])

    if (total === 0) {
      const applicationExists = await this.prismaService.client.jobApplication.count({
        where: { id: applicationId, userId },
      })

      if (applicationExists === 0) {
        throw this.notFound()
      }
    }

    return {
      data: events.map((event) => ({
        ...event,
        createdAt: event.createdAt.toISOString(),
      })),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    }
  }

  private getOrderBy(sort: JobApplicationSort): Prisma.JobApplicationOrderByWithRelationInput[] {
    switch (sort) {
      case JobApplicationSort.appliedDesc:
        return [{ appliedAt: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }]
      case JobApplicationSort.followUpAsc:
        return [{ followUpAt: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }]
      case JobApplicationSort.companyAsc:
        return [{ company: 'asc' }, { id: 'asc' }]
      case JobApplicationSort.updatedDesc:
      default:
        return [{ updatedAt: 'desc' }, { id: 'asc' }]
    }
  }

  private getFollowUpWhere(
    filter: JobApplicationFollowUpFilter,
    now = new Date(),
  ): Prisma.JobApplicationWhereInput {
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1)
    const endOfNextSevenDays = new Date(startOfToday)
    endOfNextSevenDays.setUTCDate(endOfNextSevenDays.getUTCDate() + 8)

    const activeApplication = {
      status: {
        notIn: [JobApplicationStatus.offer, JobApplicationStatus.rejected],
      },
    } satisfies Prisma.JobApplicationWhereInput

    switch (filter) {
      case JobApplicationFollowUpFilter.overdue:
        return {
          ...activeApplication,
          followUpAt: { lt: startOfToday },
        }
      case JobApplicationFollowUpFilter.today:
        return {
          ...activeApplication,
          followUpAt: { gte: startOfToday, lt: startOfTomorrow },
        }
      case JobApplicationFollowUpFilter.next7Days:
        return {
          ...activeApplication,
          followUpAt: { gte: startOfTomorrow, lt: endOfNextSevenDays },
        }
      case JobApplicationFollowUpFilter.none:
        return {
          ...activeApplication,
          followUpAt: null,
        }
    }
  }

  private async validateTechnologyIds(
    transaction: Prisma.TransactionClient,
    technologyIds: string[],
  ): Promise<string[]> {
    const uniqueIds = [...new Set(technologyIds)]

    if (!uniqueIds.length) return []

    const activeTechnologies = await transaction.technology.findMany({
      where: {
        id: { in: uniqueIds },
        isActive: true,
      },
      select: { id: true },
    })

    if (activeTechnologies.length !== uniqueIds.length) {
      throw new BadRequestException({
        error: {
          code: 'INVALID_JOB_APPLICATION_TECHNOLOGIES',
          message: 'One or more selected technologies are unavailable',
        },
      })
    }

    return uniqueIds
  }

  private normalizeCustomTechnologies(technologies: string[]): string[] {
    const seen = new Set<string>()

    return technologies.reduce<string[]>((normalized, technology) => {
      const value = technology.trim()
      const key = value.toLocaleLowerCase()

      if (value && !seen.has(key)) {
        seen.add(key)
        normalized.push(value)
      }

      return normalized
    }, [])
  }

  private nullableText(value: string | null | undefined): string | null {
    if (value === null || value === undefined) return null

    const trimmed = value.trim()
    return trimmed || null
  }

  private parseDate(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null
  }

  private formatApplication(application: JobApplicationWithTechnologies) {
    return {
      id: application.id,
      company: application.company,
      role: application.role,
      location: application.location,
      salary: application.salary,
      jobUrl: application.jobUrl,
      status: application.status,
      note: application.note,
      appliedAt: application.appliedAt?.toISOString() ?? null,
      followUpAt: application.followUpAt?.toISOString() ?? null,
      customTechnologies: application.customTechnologies,
      technologies: application.technologies.map(({ technology }) => technology),
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
    }
  }

  private notFound(): NotFoundException {
    return new NotFoundException({
      error: {
        code: 'JOB_APPLICATION_NOT_FOUND',
        message: 'Job application was not found',
      },
    })
  }
}
