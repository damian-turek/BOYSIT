import { prisma } from 'database'

export const technologiesRepository = {
  findActive(categorySlug?: string) {
    return prisma.technology.findMany({
      where: {
        isActive: true,
        ...(categorySlug
          ? {
              category: {
                slug: categorySlug,
                isActive: true,
              },
            }
          : {}),
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })
  },
}
