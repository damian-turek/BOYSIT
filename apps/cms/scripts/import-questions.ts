import { config as loadEnv } from 'dotenv'
import { readFile } from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'

export type Difficulty = 'junior' | 'middle' | 'senior'
type QuestionType = 'theory' | 'practical' | 'code' | 'system_design' | 'troubleshooting'
type AccessLevel = 'free' | 'pro'

type ImportQuestion = {
  title: string
  slug: string
  category: string
  technology?: string
  tags?: string[]
  difficulty: Difficulty
  questionType: QuestionType
  accessLevel: AccessLevel
  questionText: string
  answerText?: string
  explanation?: string
  codeSnippet?: string
  excerpt?: string
  isActive?: boolean
  verified?: boolean
}

type ImportFile = {
  questions: ImportQuestion[]
}

type CollectionSlug = 'cms-categories' | 'cms-technologies' | 'cms-tags' | 'cms-questions'

type PayloadDoc = {
  id: string
}

const difficulties = new Set<Difficulty>(['junior', 'middle', 'senior'])
const questionTypes = new Set<QuestionType>([
  'theory',
  'practical',
  'code',
  'system_design',
  'troubleshooting',
])
const accessLevels = new Set<AccessLevel>(['free', 'pro'])

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

const defaultFile = path.resolve(process.cwd(), '../../docs/payload-questions.seed.json')
const filePath = path.resolve(process.cwd(), process.argv[2] ?? defaultFile)

loadEnv({ path: '.env', quiet: true })

const assertString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string`)
  }

  return value.trim()
}

const validateQuestion = (question: ImportQuestion, index: number): ImportQuestion => {
  const prefix = `questions[${index}]`

  assertString(question.title, `${prefix}.title`)
  assertString(question.slug, `${prefix}.slug`)
  assertString(question.category, `${prefix}.category`)
  assertString(question.questionText, `${prefix}.questionText`)

  if (!difficulties.has(question.difficulty)) {
    throw new Error(`${prefix}.difficulty is invalid: ${question.difficulty}`)
  }

  if (!questionTypes.has(question.questionType)) {
    throw new Error(`${prefix}.questionType is invalid: ${question.questionType}`)
  }

  if (!accessLevels.has(question.accessLevel)) {
    throw new Error(`${prefix}.accessLevel is invalid: ${question.accessLevel}`)
  }

  return {
    ...question,
    category: question.category.trim(),
    slug: question.slug.trim(),
    tags: question.tags?.map((tag) => tag.trim()).filter(Boolean) ?? [],
    technology: question.technology?.trim(),
    title: question.title.trim(),
  }
}

const readImportFile = async (): Promise<ImportFile> => {
  const raw = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw) as ImportFile

  if (!Array.isArray(parsed.questions)) {
    throw new Error('Import file must contain a questions array')
  }

  return {
    questions: parsed.questions.map(validateQuestion),
  }
}

const findBySlug = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  slug: string,
): Promise<PayloadDoc | null> => {
  const result = await payload.find({
    collection,
    depth: 0,
    limit: 1,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return (result.docs[0] as PayloadDoc | undefined) ?? null
}

const upsertBySlug = async (
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  slug: string,
  data: Record<string, unknown>,
): Promise<PayloadDoc> => {
  const existing = await findBySlug(payload, collection, slug)
  const localApi = payload as unknown as {
    create: (args: {
      collection: CollectionSlug
      data: Record<string, unknown>
    }) => Promise<PayloadDoc>
    update: (args: {
      collection: CollectionSlug
      data: Record<string, unknown>
      id: string
    }) => Promise<PayloadDoc>
  }

  if (existing) {
    return localApi.update({
      collection,
      data,
      id: existing.id,
    })
  }

  return localApi.create({
    collection,
    data,
  })
}

const main = async () => {
  const { default: config } = await import('../src/payload.config')
  const importFile = await readImportFile()
  const payload = await getPayload({ config })

  const categoryIds = new Map<string, string>()
  const technologyIds = new Map<string, string>()
  const tagIds = new Map<string, string>()

  const categories = [...new Set(importFile.questions.map((question) => question.category))]
  const technologies = [
    ...new Set(importFile.questions.map((question) => question.technology).filter(Boolean)),
  ] as string[]
  const tags = [...new Set(importFile.questions.flatMap((question) => question.tags ?? []))]

  for (const categoryName of categories) {
    const slug = slugify(categoryName)
    const category = await upsertBySlug(payload, 'cms-categories', slug, {
      description: `${categoryName} interview preparation questions.`,
      isActive: true,
      name: categoryName,
      slug,
    })

    categoryIds.set(categoryName, category.id)
  }

  for (const technologyName of technologies) {
    const slug = slugify(technologyName)
    const firstQuestion = importFile.questions.find(
      (question) => question.technology === technologyName,
    )
    const categoryId = firstQuestion ? categoryIds.get(firstQuestion.category) : undefined

    const technology = await upsertBySlug(payload, 'cms-technologies', slug, {
      category: categoryId,
      description: `${technologyName} interview preparation questions.`,
      isActive: true,
      name: technologyName,
      slug,
    })

    technologyIds.set(technologyName, technology.id)
  }

  for (const tagName of tags) {
    const slug = slugify(tagName)
    const tag = await upsertBySlug(payload, 'cms-tags', slug, {
      name: tagName,
      slug,
    })

    tagIds.set(tagName, tag.id)
  }

  let createdOrUpdated = 0

  for (const question of importFile.questions) {
    const categoryId = categoryIds.get(question.category)

    if (!categoryId) {
      throw new Error(`Category was not imported: ${question.category}`)
    }

    const technologyId = question.technology ? technologyIds.get(question.technology) : undefined
    const questionTagIds = (question.tags ?? [])
      .map((tag) => tagIds.get(tag))
      .filter(Boolean) as string[]

    await upsertBySlug(payload, 'cms-questions', question.slug, {
      accessLevel: question.accessLevel,
      answerText: question.answerText,
      category: categoryId,
      codeSnippet: question.codeSnippet,
      difficulty: question.difficulty,
      excerpt: question.excerpt,
      explanation: question.explanation,
      isActive: question.isActive ?? true,
      questionText: question.questionText,
      questionType: question.questionType,
      slug: question.slug,
      tags: questionTagIds,
      technology: technologyId,
      title: question.title,
      verified: question.verified ?? false,
    })

    createdOrUpdated += 1
  }

  console.log(
    [
      `Imported ${createdOrUpdated} questions`,
      `${categories.length} categories`,
      `${technologies.length} technologies`,
      `${tags.length} tags`,
      `from ${filePath}`,
    ].join(', '),
  )
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
