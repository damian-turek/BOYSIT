import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadEnv } from 'dotenv'
import { Client as PostgresClient } from 'pg'

import { AccessLevel, Difficulty, QuestionType } from '../generated/prisma/enums.js'
import { PrismaClient } from '../generated/prisma/client.js'

loadEnv({ path: '.env', quiet: true })
loadEnv({ path: '../../apps/cms/.env', quiet: true })

type PayloadCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean | null
}

type PayloadTechnology = PayloadCategory & {
  category_id: string | null
}

type PayloadTag = {
  id: string
  name: string
  slug: string
}

type PayloadQuestion = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  question_text: string
  answer_text: string | null
  explanation: string | null
  code_snippet: string | null
  category_id: string | null
  technology_id: string | null
  difficulty: Difficulty
  question_type: QuestionType
  access_level: AccessLevel
  is_active: boolean | null
  verified: boolean | null
}

type PayloadQuestionTag = {
  question_id: string
  tag_id: string
}

const appDatabaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL
const payloadDatabaseUrl = process.env.PAYLOAD_DATABASE_URL

if (!appDatabaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL is required for the Prisma app database')
}

if (!payloadDatabaseUrl) {
  throw new Error('PAYLOAD_DATABASE_URL is required for the Payload CMS database')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: appDatabaseUrl }),
})

const payloadDb = new PostgresClient({
  connectionString: payloadDatabaseUrl,
})

const assertDifficulty = (value: string): Difficulty => {
  if (Object.values(Difficulty).includes(value as Difficulty)) {
    return value as Difficulty
  }

  throw new Error(`Unsupported Payload difficulty: ${value}`)
}

const assertQuestionType = (value: string): QuestionType => {
  if (Object.values(QuestionType).includes(value as QuestionType)) {
    return value as QuestionType
  }

  throw new Error(`Unsupported Payload question type: ${value}`)
}

const assertAccessLevel = (value: string): AccessLevel => {
  if (Object.values(AccessLevel).includes(value as AccessLevel)) {
    return value as AccessLevel
  }

  throw new Error(`Unsupported Payload access level: ${value}`)
}

const fetchPayloadRows = async () => {
  const categories = await payloadDb.query<PayloadCategory>(`
      SELECT id, name, slug, description, is_active
      FROM cms_categories
      ORDER BY created_at ASC
    `)
  const technologies = await payloadDb.query<PayloadTechnology>(`
      SELECT id, name, slug, description, is_active, category_id
      FROM cms_technologies
      ORDER BY created_at ASC
    `)
  const tags = await payloadDb.query<PayloadTag>(`
      SELECT id, name, slug
      FROM cms_tags
      ORDER BY created_at ASC
    `)
  const questions = await payloadDb.query<PayloadQuestion>(`
      SELECT
        id,
        title,
        slug,
        excerpt,
        question_text,
        answer_text,
        explanation,
        code_snippet,
        category_id,
        technology_id,
        difficulty,
        question_type,
        access_level,
        is_active,
        verified
      FROM cms_questions
      ORDER BY created_at ASC
    `)
  const questionTags = await payloadDb.query<PayloadQuestionTag>(`
      SELECT parent_id AS question_id, cms_tags_id AS tag_id
      FROM cms_questions_rels
      WHERE path = 'tags' AND cms_tags_id IS NOT NULL
      ORDER BY "order" ASC
    `)

  return {
    categories: categories.rows,
    technologies: technologies.rows,
    tags: tags.rows,
    questions: questions.rows,
    questionTags: questionTags.rows,
  }
}

const main = async () => {
  await payloadDb.connect()

  const rows = await fetchPayloadRows()

  const categoryIdsByPayloadId = new Map<string, string>()
  const technologyIdsByPayloadId = new Map<string, string>()
  const tagIdsByPayloadId = new Map<string, string>()

  for (const category of rows.categories) {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ slug: category.slug }, { name: category.name }],
      },
    })

    const synced = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: {
            description: category.description,
            isActive: category.is_active ?? true,
            name: category.name,
            slug: category.slug,
          },
        })
      : await prisma.category.create({
          data: {
            description: category.description,
            isActive: category.is_active ?? true,
            name: category.name,
            slug: category.slug,
          },
        })

    categoryIdsByPayloadId.set(category.id, synced.id)
  }

  for (const technology of rows.technologies) {
    const categoryId = technology.category_id
      ? categoryIdsByPayloadId.get(technology.category_id) ?? null
      : null
    const existing = await prisma.technology.findFirst({
      where: {
        OR: [{ slug: technology.slug }, { name: technology.name }],
      },
    })

    const synced = existing
      ? await prisma.technology.update({
          where: { id: existing.id },
          data: {
            categoryId,
            description: technology.description,
            isActive: technology.is_active ?? true,
            name: technology.name,
            slug: technology.slug,
          },
        })
      : await prisma.technology.create({
          data: {
            categoryId,
            description: technology.description,
            isActive: technology.is_active ?? true,
            name: technology.name,
            slug: technology.slug,
          },
        })

    technologyIdsByPayloadId.set(technology.id, synced.id)
  }

  for (const tag of rows.tags) {
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ slug: tag.slug }, { name: tag.name }],
      },
    })

    const synced = existing
      ? await prisma.tag.update({
          where: { id: existing.id },
          data: {
            name: tag.name,
            slug: tag.slug,
          },
        })
      : await prisma.tag.create({
          data: {
            name: tag.name,
            slug: tag.slug,
          },
        })

    tagIdsByPayloadId.set(tag.id, synced.id)
  }

  for (const question of rows.questions) {
    const synced = await prisma.question.upsert({
      where: { slug: question.slug },
      update: {
        accessLevel: assertAccessLevel(question.access_level),
        answerText: question.answer_text,
        categoryId: question.category_id
          ? categoryIdsByPayloadId.get(question.category_id) ?? null
          : null,
        codeSnippet: question.code_snippet,
        difficulty: assertDifficulty(question.difficulty),
        excerpt: question.excerpt,
        explanation: question.explanation,
        isActive: question.is_active ?? true,
        questionText: question.question_text,
        questionType: assertQuestionType(question.question_type),
        technologyId: question.technology_id
          ? technologyIdsByPayloadId.get(question.technology_id) ?? null
          : null,
        title: question.title,
        verified: question.verified ?? false,
      },
      create: {
        accessLevel: assertAccessLevel(question.access_level),
        answerText: question.answer_text,
        categoryId: question.category_id
          ? categoryIdsByPayloadId.get(question.category_id) ?? null
          : null,
        codeSnippet: question.code_snippet,
        difficulty: assertDifficulty(question.difficulty),
        excerpt: question.excerpt,
        explanation: question.explanation,
        isActive: question.is_active ?? true,
        questionText: question.question_text,
        questionType: assertQuestionType(question.question_type),
        slug: question.slug,
        technologyId: question.technology_id
          ? technologyIdsByPayloadId.get(question.technology_id) ?? null
          : null,
        title: question.title,
        verified: question.verified ?? false,
      },
    })

    const tagIds = rows.questionTags
      .filter((relation) => relation.question_id === question.id)
      .map((relation) => tagIdsByPayloadId.get(relation.tag_id))
      .filter((tagId): tagId is string => Boolean(tagId))

    await prisma.questionTag.deleteMany({
      where: { questionId: synced.id },
    })

    if (tagIds.length > 0) {
      await prisma.questionTag.createMany({
        data: tagIds.map((tagId) => ({
          questionId: synced.id,
          tagId,
        })),
        skipDuplicates: true,
      })
    }
  }

  console.log(
    [
      `Synced ${rows.categories.length} categories`,
      `${rows.technologies.length} technologies`,
      `${rows.tags.length} tags`,
      `${rows.questions.length} questions`,
    ].join(', '),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await Promise.allSettled([payloadDb.end(), prisma.$disconnect()])
  })
