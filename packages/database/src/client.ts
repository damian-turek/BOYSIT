import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { PrismaClient } from '../generated/prisma/client.js'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))

loadEnv({ path: path.resolve(currentDirectory, '../.env'), quiet: true })
loadEnv({ path: path.resolve(currentDirectory, '../../.env'), quiet: true })

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required to initialize Prisma')
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const adapter = new PrismaPg({ connectionString })

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type DatabaseClient = PrismaClient
