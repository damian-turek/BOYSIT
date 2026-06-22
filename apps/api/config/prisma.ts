import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'database/generated/prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({ adapter })
