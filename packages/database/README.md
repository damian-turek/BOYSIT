# BOYSIT App Database

This package owns the Prisma schema and client for the BOYSIT application backend.

It is separate from Payload CMS. Payload should use its own Supabase database/project. This package is for the future Fastify API and app-facing data.

## Stack

```txt
PostgreSQL on Supabase
Prisma 7
@prisma/adapter-pg
```

## Environment

Copy the example file:

```sh
cp packages/database/.env.example packages/database/.env
```

Use the Supabase **direct database URL** when possible:

```env
DATABASE_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require"
```

Notes:

- `DATABASE_URL` is used by the app runtime.
- `DIRECT_URL` is preferred by Prisma CLI commands when present.
- If your Supabase direct host requires IPv6 and your network does not support it, use Supabase IPv4 add-on or run migrations from an environment with IPv6 support.
- Keep this database separate from Payload CMS if possible.

## Commands

Run from the repo root:

```sh
pnpm --filter database generate
pnpm --filter database migrate:dev
pnpm --filter database migrate:deploy
pnpm --filter database seed
pnpm --filter database studio
```

For production/Supabase deployments, use:

```sh
pnpm --filter database migrate:deploy
```

Do not use `migrate:dev` against production.

## Current Schema

The baseline app schema includes:

- `User`
- `Category`
- `Technology`
- `Question`
- `Tag`
- `QuestionTag`
- `Attempt`
- `Bookmark`
- `Subscription`

This supports the first Fastify backend MVP:

- auth user sync
- public question catalog
- free/pro content access
- attempts
- bookmarks
- progress summaries
- Stripe subscription state

## Importing In The API

The future Fastify backend should import the singleton Prisma client:

```ts
import { prisma } from 'database'
```

Do not create new `PrismaClient` instances inside route handlers.
