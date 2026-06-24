import { prisma } from 'database'

export const tagsRepository = {
  findPublic() {
    return prisma.tag.findMany({
      where: {
        questionTags: {
          some: {
            question: {
              isActive: true,
              verified: true,
            },
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
      },
    })
  },
}
