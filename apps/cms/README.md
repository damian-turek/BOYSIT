# BOYSIT Payload CMS

Payload CMS admin app for managing interview-prep content.

## Environment

Create `apps/cms/.env` from `.env.example`.

Use a separate Supabase database/project for `PAYLOAD_DATABASE_URL`. Do not point this at the Prisma app database unless you intentionally want both systems in one schema.

## Local Commands

```bash
pnpm install
pnpm --filter cms generate:importmap
pnpm --filter cms dev
```

Open `http://localhost:3001/admin` and create the first admin user.
