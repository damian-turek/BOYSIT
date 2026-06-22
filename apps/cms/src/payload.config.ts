import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { Questions } from '@/collections/Questions'
import { Tags } from '@/collections/Tags'
import { Technologies } from '@/collections/Technologies'
import { Users } from '@/collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

if (!process.env.PAYLOAD_DATABASE_URL) {
  throw new Error('PAYLOAD_DATABASE_URL is required for the CMS')
}

if (!process.env.PAYLOAD_SECRET) {
  throw new Error('PAYLOAD_SECRET is required for the CMS')
}

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
  },
  collections: [Users, Categories, Technologies, Tags, Questions],
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
