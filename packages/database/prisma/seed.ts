import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required to seed the database')
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
})

const categories = [
  {
    name: 'Frontend',
    slug: 'frontend',
    description: 'Browser, UI, JavaScript, TypeScript, React, and web fundamentals.',
  },
  {
    name: 'Backend',
    slug: 'backend',
    description: 'APIs, server-side architecture, databases, security, and scalability.',
  },
  {
    name: 'Databases',
    slug: 'databases',
    description: 'SQL, indexing, transactions, modeling, and query performance.',
  },
]

const technologies = [
  { name: 'JavaScript', slug: 'javascript', categorySlug: 'frontend' },
  { name: 'TypeScript', slug: 'typescript', categorySlug: 'frontend' },
  { name: 'React', slug: 'react', categorySlug: 'frontend' },
  { name: 'Node.js', slug: 'nodejs', categorySlug: 'backend' },
  { name: 'PostgreSQL', slug: 'postgresql', categorySlug: 'databases' },
]

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
  }

  for (const technology of technologies) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: technology.categorySlug },
    })

    await prisma.technology.upsert({
      where: { slug: technology.slug },
      update: {
        name: technology.name,
        categoryId: category.id,
      },
      create: {
        name: technology.name,
        slug: technology.slug,
        categoryId: category.id,
      },
    })
  }

  const frontend = await prisma.category.findUniqueOrThrow({ where: { slug: 'frontend' } })
  const javascript = await prisma.technology.findUniqueOrThrow({ where: { slug: 'javascript' } })

  await prisma.question.upsert({
    where: { slug: 'explain-javascript-closures' },
    update: {
      categoryId: frontend.id,
      technologyId: javascript.id,
    },
    create: {
      title: 'Explain JavaScript closures',
      slug: 'explain-javascript-closures',
      excerpt: 'Describe what a closure is and when it is useful.',
      questionText: 'What is a closure in JavaScript? Give a practical example.',
      answerText:
        'A closure is a function that keeps access to variables from its lexical scope even after the outer function has returned.',
      explanation:
        'Closures are commonly used for encapsulation, callbacks, factories, and maintaining state without global variables.',
      difficulty: 'junior',
      questionType: 'theory',
      accessLevel: 'free',
      isActive: true,
      verified: true,
      categoryId: frontend.id,
      technologyId: javascript.id,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
