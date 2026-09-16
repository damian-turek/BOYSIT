import { Injectable } from '@nestjs/common'
import { JobApplicationStatus } from 'database'

import { PrismaService } from '../prisma/prisma.service'

const TOP_CATEGORIES_LIMIT = 8
const TOP_TECHNOLOGIES_LIMIT = 5

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getOverview(userId: string) {
    const [
      categoryGroups,
      totalQuestions,
      totalCategories,
      totalUsers,
      totalTechnologies,
      jobTrackerActiveCount,
      technologyGroups,
    ] = await Promise.all([
      this.prismaService.client.question.groupBy({
        by: ['categoryId'],
        where: { isActive: true, categoryId: { not: null } },
        _count: { _all: true },
      }),
      this.prismaService.client.question.count({ where: { isActive: true } }),
      this.prismaService.client.category.count({ where: { isActive: true } }),
      this.prismaService.client.user.count(),
      this.prismaService.client.technology.count({ where: { isActive: true } }),
      this.prismaService.client.jobApplication.count({
        where: {
          userId,
          status: { notIn: [JobApplicationStatus.offer, JobApplicationStatus.rejected] },
        },
      }),
      this.prismaService.client.question.groupBy({
        by: ['technologyId'],
        where: { isActive: true, technologyId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { technologyId: 'desc' } },
        take: TOP_TECHNOLOGIES_LIMIT,
      }),
    ])

    const categoryIds = categoryGroups
      .map((group) => group.categoryId)
      .filter((id): id is string => id !== null)
    const technologyIds = technologyGroups
      .map((group) => group.technologyId)
      .filter((id): id is string => id !== null)

    const [categories, technologies] = await Promise.all([
      this.prismaService.client.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, slug: true },
      }),
      this.prismaService.client.technology.findMany({
        where: { id: { in: technologyIds } },
        select: { id: true, name: true },
      }),
    ])

    const categoryById = new Map(categories.map((category) => [category.id, category]))
    const technologyById = new Map(technologies.map((technology) => [technology.id, technology]))

    const topCategories = categoryGroups
      .map((group) => {
        const category = group.categoryId ? categoryById.get(group.categoryId) : undefined
        if (!category) return null
        return {
          name: category.name,
          slug: category.slug,
          questionCount: group._count._all,
        }
      })
      .filter((category): category is { name: string; slug: string; questionCount: number } => category !== null)
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, TOP_CATEGORIES_LIMIT)

    const topTechnologyTags = technologyGroups
      .map((group) => (group.technologyId ? technologyById.get(group.technologyId)?.name : undefined))
      .filter((name): name is string => !!name)

    return {
      data: {
        topCategories,
        platformStats: {
          questions: totalQuestions,
          categories: totalCategories,
          learners: totalUsers,
          technologies: totalTechnologies,
        },
        practiceTools: {
          questions: totalQuestions,
          jobTrackerActive: jobTrackerActiveCount,
        },
        questionsBank: {
          total: totalQuestions,
          tags: topTechnologyTags,
        },
      },
    }
  }
}
