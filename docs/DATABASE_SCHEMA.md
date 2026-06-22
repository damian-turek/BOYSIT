# Database Schema Guide

This document describes the current MVP database schema for backend and frontend work.
Source of truth: `packages/database/prisma/schema.prisma`.

## Main Entities

### User

Application user synced with the auth provider.

Fields:

- `id`: UUID primary key.
- `email`: unique email.
- `name`: optional display name.
- `authProviderId`: optional unique external auth user id.
- `plan`: `free`, `pro`, or `admin`.
- `proUntil`: optional date until pro access is valid.
- `createdAt`, `updatedAt`: timestamps.

Relations:

- Has many `Attempt`.
- Has many `Bookmark`.
- Has many `Subscription`.

Backend notes:

- Use `authProviderId` to map external auth users to local users.
- Treat `plan = admin` separately from paid user access.
- A user has pro access when `plan = pro/admin`, or when subscription logic says active.

### Category

Top-level grouping for questions, for example `Frontend`, `Backend`, `DevOps`.

Fields:

- `id`: UUID primary key.
- `name`: unique display name.
- `slug`: unique URL/filter identifier.
- `description`: optional description.
- `isActive`: whether this category should be visible.
- `createdAt`, `updatedAt`: timestamps.

Relations:

- Has many `Technology`.
- Has many `Question`.

Frontend use:

- Use `slug` for URLs and query params.
- Show only `isActive = true` categories in public filters.

### Technology

Specific technology inside a category, for example `React`, `Node.js`, `PostgreSQL`.

Fields:

- `id`: UUID primary key.
- `name`: unique display name.
- `slug`: unique URL/filter identifier.
- `description`: optional description.
- `isActive`: whether this technology should be visible.
- `categoryId`: optional parent category id.
- `createdAt`, `updatedAt`: timestamps.

Relations:

- Belongs to optional `Category`.
- Has many `Question`.

Frontend use:

- Use `slug` for URLs and query params.
- Technology filter can be dependent on selected category.

### Question

Interview question content.

Fields:

- `id`: UUID primary key.
- `title`: display title.
- `slug`: unique URL identifier.
- `excerpt`: short preview text.
- `questionText`: full question body.
- `answerText`: expected answer, nullable.
- `explanation`: explanation/details, nullable.
- `codeSnippet`: optional code example.
- `difficulty`: `junior`, `middle`, `senior`.
- `questionType`: `theory`, `practical`, `code`, `system_design`, `troubleshooting`.
- `accessLevel`: `free` or `pro`.
- `isActive`: whether the question is visible.
- `verified`: whether content was reviewed.
- `categoryId`: optional category id.
- `technologyId`: optional technology id.
- `createdAt`, `updatedAt`: timestamps.

Relations:

- Belongs to optional `Category`.
- Belongs to optional `Technology`.
- Has many `Attempt`.
- Has many `Bookmark`.
- Has many tags through `QuestionTag`.

Public preview response should include:

- `id`
- `slug`
- `title`
- `excerpt`
- `difficulty`
- `questionType`
- `accessLevel`
- `category`
- `technology`
- `tags`

Protected/full response can include:

- `questionText`
- `answerText`
- `explanation`
- `codeSnippet`

Backend access rule:

- `accessLevel = free`: public preview and full content can be available.
- `accessLevel = pro`: preview can be public, but answer/explanation/full content requires access.
- Always filter public lists by `isActive = true`.
- Admin views may include inactive and unverified questions.

### Tag

Many-to-many label for questions, for example `hooks`, `performance`, `indexes`.

Fields:

- `id`: UUID primary key.
- `name`: unique display name.
- `slug`: unique URL/filter identifier.

Relations:

- Connected to questions through `QuestionTag`.

Frontend use:

- Tags can be used as secondary filters or chips.

### QuestionTag

Join table between `Question` and `Tag`.

Fields:

- `questionId`
- `tagId`

Primary key:

- Composite: `questionId + tagId`.

Backend notes:

- Use this table for tag filtering.
- Deleting a question or tag cascades join rows.

### Attempt

User answer attempt for a question.

Fields:

- `id`: UUID primary key.
- `userId`: owner user id.
- `questionId`: attempted question id.
- `userAnswer`: submitted answer text.
- `score`: optional numeric score.
- `feedback`: optional feedback.
- `createdAt`: timestamp.

Relations:

- Belongs to `User`.
- Belongs to `Question`.

Frontend use:

- Use for progress history, last attempt, score, and activity calendar.

Backend notes:

- Attempts are user-private.
- Filter by authenticated `userId`; do not allow users to read other users' attempts.

### Bookmark

Saved question for a user.

Fields:

- `userId`: owner user id.
- `questionId`: saved question id.
- `createdAt`: timestamp.

Primary key:

- Composite: `userId + questionId`.

Frontend use:

- Use to show saved state on question cards.
- Use `/bookmarks` style endpoint for saved question list.

Backend notes:

- Bookmark create should be idempotent.
- Bookmark delete should be safe if already absent.

### Subscription

Payment/subscription state, currently Stripe-shaped.

Fields:

- `id`: UUID primary key.
- `userId`: owner user id.
- `stripeCustomerId`: optional unique Stripe customer id.
- `stripeSubscriptionId`: optional unique Stripe subscription id.
- `stripePriceId`: optional Stripe price id.
- `status`: subscription lifecycle status.
- `currentPeriodEnd`: optional current paid period end.
- `cancelAtPeriodEnd`: boolean.
- `createdAt`, `updatedAt`: timestamps.

Statuses:

- `incomplete`
- `incomplete_expired`
- `trialing`
- `active`
- `past_due`
- `canceled`
- `unpaid`

Backend access rule:

- Treat `active` and usually `trialing` as paid access.
- For `past_due`, decide product policy before exposing pro content.
- Keep `User.plan` and subscription state synchronized carefully.

## Filter Contract For Questions

Recommended query params for question lists:

- `category`: category `slug`.
- `technology`: technology `slug`.
- `difficulty`: `junior | middle | senior`.
- `type`: `theory | practical | code | system_design | troubleshooting`.
- `access`: `free | pro`.
- `tag`: tag `slug`, repeatable or comma-separated.
- `verified`: admin-only boolean.
- `isActive`: admin-only boolean.
- `search`: text search over `title`, `excerpt`, and possibly `questionText`.
- `page` / `limit` or `cursor` / `limit`.

Default public filters:

- `isActive = true`
- include both `free` and `pro` previews
- hide full paid content for users without access

Recommended public list shape:

```json
{
  "items": [
    {
      "id": "uuid",
      "slug": "react-use-effect-cleanup",
      "title": "How does useEffect cleanup work?",
      "excerpt": "Explain when React runs cleanup functions...",
      "difficulty": "middle",
      "questionType": "theory",
      "accessLevel": "free",
      "category": { "id": "uuid", "name": "Frontend", "slug": "frontend" },
      "technology": { "id": "uuid", "name": "React", "slug": "react" },
      "tags": [{ "id": "uuid", "name": "Hooks", "slug": "hooks" }],
      "isBookmarked": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120
  }
}
```

Recommended detail shape:

```json
{
  "id": "uuid",
  "slug": "react-use-effect-cleanup",
  "title": "How does useEffect cleanup work?",
  "excerpt": "Explain when React runs cleanup functions...",
  "questionText": "Full question text...",
  "answerText": "Expected answer...",
  "explanation": "Detailed explanation...",
  "codeSnippet": "useEffect(() => { ... }, [])",
  "difficulty": "middle",
  "questionType": "theory",
  "accessLevel": "free",
  "category": { "id": "uuid", "name": "Frontend", "slug": "frontend" },
  "technology": { "id": "uuid", "name": "React", "slug": "react" },
  "tags": [{ "id": "uuid", "name": "Hooks", "slug": "hooks" }],
  "isBookmarked": false,
  "latestAttempt": null
}
```

For locked pro content, return stable metadata and omit locked fields:

```json
{
  "id": "uuid",
  "slug": "system-design-cache-invalidation",
  "title": "Design cache invalidation for a feed",
  "excerpt": "Discuss cache invalidation strategies...",
  "difficulty": "senior",
  "questionType": "system_design",
  "accessLevel": "pro",
  "locked": true
}
```

## Recommended Endpoints

Public:

- `GET /categories`
- `GET /technologies?category=frontend`
- `GET /tags`
- `GET /questions`
- `GET /questions/:slug`

Authenticated:

- `GET /me`
- `GET /me/bookmarks`
- `POST /questions/:id/bookmark`
- `DELETE /questions/:id/bookmark`
- `GET /me/attempts`
- `POST /questions/:id/attempts`
- `GET /me/progress`

Admin:

- CRUD for categories, technologies, tags, questions.
- Admin question list may filter by `isActive`, `verified`, `accessLevel`.

## Indexes Relevant For Backend

Already indexed:

- `Question.categoryId`
- `Question.technologyId`
- `Question.difficulty`
- `Question.questionType`
- `Question.accessLevel`
- `Question.isActive`
- `Question.verified`
- `Technology.categoryId`
- `QuestionTag.tagId`
- `Attempt.userId`
- `Attempt.questionId`
- `Attempt.createdAt`
- `Bookmark.questionId`
- `Subscription.userId`
- `Subscription.status`

Potential future indexes:

- Full-text search index for question title/excerpt/body.
- Composite indexes for common filters, for example `isActive + categoryId + difficulty`.

## Naming Notes

Prisma model fields use camelCase.
Database columns use snake_case where mapped with `@map`.
API responses should use camelCase to match frontend TypeScript conventions.

Use `slug` for URLs and query params. Use `id` for mutations and internal relations.
