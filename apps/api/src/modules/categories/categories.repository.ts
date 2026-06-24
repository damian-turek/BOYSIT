import { prisma } from 'database'

export const categoriesRepository = {
  findActive() {
    return prisma.category.findMany({
      where: {
        isActive: true,
        questions: {
          some: {
            isActive: true,
            verified: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    })
  },
}
