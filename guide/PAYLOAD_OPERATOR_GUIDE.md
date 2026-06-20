# Payload Operator Guide

This guide is only for operating BOYSIT Payload CMS in this repository.

## Required Env Files

CMS env:

```text
apps/cms/.env
```

Required keys:

```env
PAYLOAD_SECRET="..."
PAYLOAD_DATABASE_URL="..."
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"
PAYLOAD_DB_PUSH="true"
```

Backend database env for sync:

```text
packages/database/.env
```

Required key:

```env
DATABASE_URL="..."
```

Optional preferred migration/sync key:

```env
DIRECT_URL="..."
```

## First Setup

Install dependencies:

```bash
pnpm install
```

Generate Payload import map:

```bash
pnpm --filter cms generate:importmap
```

Generate Payload types:

```bash
pnpm --filter cms generate:types
```

Check CMS TypeScript:

```bash
pnpm --filter cms check-types
```

Check CMS lint:

```bash
pnpm --filter cms lint
```

## Run CMS

Start Payload CMS:

```bash
pnpm --filter cms dev
```

Open:

```text
http://localhost:3001/admin
```

If port `3001` is already busy, stop the old terminal process with `Ctrl+C`, then run the command again.

## Create First Admin

Start CMS:

```bash
pnpm --filter cms dev
```

Open:

```text
http://localhost:3001/admin
```

Create the first admin user in the browser.

## Edit Content

Use Payload Admin:

```text
http://localhost:3001/admin
```

Editable collections:

```text
Categories
Technologies
Tags
Questions
```

Rules:

- Do not edit Payload internal tables.
- Do not hard-delete content.
- Disable content with `isActive=false`.
- Slugs are immutable after creation.
- Questions require a category.
- Technology is optional.

## Import Seed Questions

Default seed file:

```text
docs/payload-questions.seed.json
```

Import it into Payload CMS:

```bash
pnpm --filter cms import:questions
```

Import a custom file:

```bash
pnpm --filter cms import:questions ../../path/to/questions.json
```

Expected JSON shape:

```json
{
  "questions": [
    {
      "title": "Explain JavaScript closures",
      "slug": "explain-javascript-closures",
      "category": "Frontend",
      "technology": "JavaScript",
      "tags": ["closures", "scope"],
      "difficulty": "junior",
      "questionType": "theory",
      "accessLevel": "free",
      "questionText": "What is a closure in JavaScript?",
      "answerText": "A closure is...",
      "explanation": "Closures are useful because...",
      "isActive": true,
      "verified": true
    }
  ]
}
```

Allowed values:

```text
difficulty: junior | middle | senior
questionType: theory | practical | code | system_design | troubleshooting
accessLevel: free | pro
```

The importer:

- creates missing categories
- creates missing technologies
- creates missing tags
- upserts questions by slug
- links question tags

## Sync CMS Content To Backend DB

After editing or importing content in Payload, run:

```bash
pnpm --filter database sync:payload
```

This copies:

```text
cms_categories     -> categories
cms_technologies   -> technologies
cms_tags           -> tags
cms_questions      -> questions
cms_questions_rels -> question_tags
```

Run this every time content should become available to the backend/frontend.

## Full Content Update Workflow

Start CMS:

```bash
pnpm --filter cms dev
```

Edit content in:

```text
http://localhost:3001/admin
```

Import bulk questions if needed:

```bash
pnpm --filter cms import:questions
```

Sync to backend DB:

```bash
pnpm --filter database sync:payload
```

Verify checks:

```bash
pnpm --filter cms check-types
pnpm --filter cms lint
pnpm --filter database check-types
```

## Regenerate Payload Files After CMS Config Changes

If collections or fields change:

```bash
pnpm --filter cms generate:types
pnpm --filter cms generate:importmap
pnpm --filter cms check-types
```

Restart CMS:

```bash
pnpm --filter cms dev
```

## Verify Payload DB Counts

Use this only for quick local verification:

```bash
cd packages/database
node -e 'require("dotenv").config({ path: "../../apps/cms/.env", quiet: true }); const { Client } = require("pg"); const client = new Client({ connectionString: process.env.PAYLOAD_DATABASE_URL }); (async () => { await client.connect(); for (const table of ["cms_categories", "cms_technologies", "cms_tags", "cms_questions", "cms_questions_rels"]) { const r = await client.query(`select count(*)::int as count from ${table}`); console.log(`${table}=${r.rows[0].count}`); } await client.end(); })().catch(e => { console.error(e.message); process.exit(1); });'
```

## Verify Backend DB Counts

```bash
cd packages/database
node -e 'require("dotenv").config({ path: ".env", quiet: true }); const { Client } = require("pg"); const client = new Client({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL }); (async () => { await client.connect(); for (const table of ["categories", "technologies", "tags", "questions", "question_tags"]) { const r = await client.query(`select count(*)::int as count from ${table}`); console.log(`${table}=${r.rows[0].count}`); } await client.end(); })().catch(e => { console.error(e.message); process.exit(1); });'
```

## Common Problems

### Port 3001 Is Busy

Stop the existing process:

```bash
Ctrl+C
```

Then restart:

```bash
pnpm --filter cms dev
```

### Payload Cannot Connect To Postgres

Check:

```text
apps/cms/.env
```

Required:

```env
PAYLOAD_DATABASE_URL="..."
```

Then restart CMS.

### Imported Content Does Not Appear In Frontend

Run sync:

```bash
pnpm --filter database sync:payload
```

### CMS Types Are Outdated

Run:

```bash
pnpm --filter cms generate:types
pnpm --filter cms check-types
```

### Import Script Cannot Find A File

Use an explicit path:

```bash
pnpm --filter cms import:questions ../../docs/payload-questions.seed.json
```

### Sync Fails After Changing Slugs

Do not change slugs after creation.

If a slug must change, handle cleanup manually in both Payload CMS and backend DB.
