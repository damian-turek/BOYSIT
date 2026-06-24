import { Prisma, prisma } from 'database'

import type { QuestionsQuery } from './questions.schemas.js'

const splitCsv = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined

  const values = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  return values.length > 0 ? values : undefined
}

const createWhere = (query: QuestionsQuery): Prisma.QuestionWhereInput => {
  const categorySlugs = splitCsv(query.categorySlug)
  const technologySlugs = splitCsv(query.technologySlug)
  const tagSlugs = splitCsv(query.tag)
  const search = query.search?.trim()

  return {
    isActive: true,
    verified: true,
    ...(categorySlugs
      ? {
          category: {
            isActive: true,
            slug: {
              in: categorySlugs,
            },
          },
        }
      : {}),
    ...(technologySlugs
      ? {
          technology: {
            isActive: true,
            slug: {
              in: technologySlugs,
            },
          },
        }
      : {}),
    ...(query.difficulty ? { difficulty: query.difficulty } : {}),
    ...(query.questionType ? { questionType: query.questionType } : {}),
    ...(query.accessLevel ? { accessLevel: query.accessLevel } : {}),
    ...(tagSlugs
      ? {
          questionTags: {
            some: {
              tag: {
                slug: {
                  in: tagSlugs,
                },
              },
            },
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              excerpt: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              questionText: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              category: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              technology: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
            {
              questionTags: {
                some: {
                  tag: {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              },
            },
          ],
        }
      : {}),
  }
}

const taxonomySelect = {
  id: true,
  name: true,
  slug: true,
} satisfies Prisma.CategorySelect

const tagsSelect = {
  tag: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.QuestionTagSelect

export const questionsRepository = {
  async findMany(query: QuestionsQuery) {
    const page = query.page ?? 1
    const pageSize = query.pageSize ?? 20
    const where = createWhere(query)

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          difficulty: true,
          questionType: true,
          accessLevel: true,
          category: {
            select: taxonomySelect,
          },
          technology: {
            select: taxonomySelect,
          },
          questionTags: {
            select: tagsSelect,
          },
        },
      }),
      prisma.question.count({ where }),
    ])

    return {
      questions,
      pagination: {
        page,
        pageSize,
        total,
      },
    }
  },

  findBySlug(slug: string) {
    return prisma.question.findFirst({
      where: {
        slug,
        isActive: true,
        verified: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        questionText: true,
        answerText: true,
        explanation: true,
        codeSnippet: true,
        difficulty: true,
        questionType: true,
        accessLevel: true,
        category: {
          select: taxonomySelect,
        },
        technology: {
          select: taxonomySelect,
        },
        questionTags: {
          select: tagsSelect,
        },
      },
    })
  },
}
