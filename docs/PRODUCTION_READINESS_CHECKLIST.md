# Production Readiness Checklist

> Last reviewed: 2026-09-23
>
> Repository branch reviewed: `fix/stripe-lifecycle`
>
> Purpose: one operational checklist for everything that must be completed or explicitly accepted
> before BOYSIT/PrepCode serves real users and accepts live payments.

## Status Rules

- `[x]` means verified in the environment named by the item.
- `[ ]` means open. Code existing on a local branch does not close a deployment item.
- **Release blocker** means public launch or live Stripe payments must not be enabled before it is
  resolved.
- Product and legal decisions must be confirmed by the owner; they must not be guessed in code.
- Never place credentials, tokens, connection strings, or customer data in this document.

## Current Snapshot

The repository is a viable commercial MVP foundation, but it is not ready for public production
yet. The application architecture is appropriate for the expected initial scale and does not need
a rewrite.

Implemented or substantially implemented:

- Next.js web application, NestJS API, Prisma application database, Supabase Auth, and separate
  Payload CMS database.
- Email/password authentication, Google OAuth, password recovery, profile editing, and verified
  account deletion.
- Question catalogue, Pro redaction, Job Tracker, flashcard exams, dashboard library endpoints,
  Stripe Checkout, Billing Portal, webhook processing, and subscription status UI.
- API liveness/readiness endpoints.
- Stripe lifecycle hardening on `fix/stripe-lifecycle`, including event idempotency, current-state
  reconciliation, checkout idempotency, one Customer per application user, duplicate-subscription
  protection, and cancellation before account deletion.

Important qualification: the Stripe hardening is currently uncommitted, has not been deployed, and
its database migration has not been applied to Supabase. It is therefore not production state.

## P0 Release Blockers

### 1. Database migration baseline and production migration

- [ ] Back up the application Supabase PostgreSQL database before any migration work.
- [ ] Inspect the production `_prisma_migrations` table and compare it with committed migrations.
- [ ] Repair or formally baseline the historically inconsistent 2026-06 migration chain.
- [ ] Replay the complete migration chain against a disposable empty PostgreSQL database.
- [ ] Run the seed/content-sync smoke test against the disposable database.
- [ ] Run `migrate:deploy` a second time and verify that it is safely idempotent.
- [ ] Reconcile any user owning multiple distinct Stripe Customer IDs; the Stripe migration
  intentionally aborts rather than choosing one silently.
- [ ] Apply `20260922000000_harden_stripe_lifecycle` to the **application** Supabase database using
  the production direct connection and `prisma migrate deploy`.
- [ ] Do not use `prisma db push` for production.
- [ ] Do not apply the application migration to the separate Payload CMS database.
- [ ] Verify billing tables, existing subscription history, API readiness, and a normal user login
  after migration.
- [ ] Document and rehearse the database rollback/restore decision before deployment.

### 2. Question visibility and paid-content security

This area remains owned by the Questions-flow developer unless ownership is explicitly changed.

- [ ] Make the question-detail query require `isActive = true`; currently a known UUID can retrieve
  an inactive question.
- [ ] Confirm whether `verified` is required for public visibility and enforce the chosen policy in
  list, detail, library, and exam queries.
- [ ] Verify that Free users never receive Pro `questionText`, answers, explanations, or code in any
  list/detail/library/exam response.
- [ ] Stabilize one UUID-based question contract across the API and web application.
- [ ] Remove or finish incompatible legacy question implementations and restore reliable direct
  detail URLs.
- [ ] Add focused authorization tests for inactive and Pro content.

### 3. Runtime security baseline

- [ ] Change the declared Next.js versions in both web and CMS manifests to the reviewed secure
  version; the installed resolution may be newer, but both manifests still declare `16.2.6`.
- [ ] Run `pnpm audit --prod` after a clean install and review direct runtime findings for Next.js,
  Fastify, `find-my-way`, `sharp`, `undici`, Payload, Prisma, and Stripe.
- [ ] Upgrade remaining exploitable production dependencies without unrelated major-version churn.
- [ ] Build and smoke-test web, API, and CMS after the upgrades.
- [ ] Run a final tracked-file and Git-history secret scan.
- [ ] Confirm the previously exposed database credential remains revoked.
- [ ] Decide and coordinate Git-history cleanup before giving broader repository access.

### 4. Reproducible deployment infrastructure

Production infrastructure work exists in a separate branch according to `docs/PLAN.md`, but it is
not present on the currently reviewed branch. Integrate it deliberately rather than recreating or
blindly merging it.

- [ ] Provision the small production VPS approved in the architecture plan.
- [ ] Provision/upgrade the external Supabase project used for application PostgreSQL and Auth.
- [ ] Merge or rebase the reviewed production-infrastructure work onto the final release branch.
- [ ] Verify production Dockerfiles for web and API.
- [ ] Verify Docker Compose startup, restart policies, health checks, and persistent operational
  directories on a clean server.
- [ ] Configure Caddy as the HTTPS reverse proxy for the web and API domains.
- [ ] Point DNS records to the VPS and verify automatic TLS certificate issuance and renewal.
- [ ] Expose only SSH, HTTP, and HTTPS through the host firewall; do not expose internal container
  ports publicly.
- [ ] Store production environment variables in the deployment secret store or protected server
  files, never in Git or image layers.
- [ ] Configure production `APP_URL`, API base URL, `CORS_ORIGIN`, Supabase URLs/keys, and database
  URLs.
- [ ] Verify `/api/v1/health/live` and `/api/v1/health/ready` through the public reverse proxy.
- [ ] Perform a documented deployment and rollback rehearsal.

### 5. Stripe live configuration and validation

The application code is substantially implemented on `fix/stripe-lifecycle`; the following
external and deployment work is still required.

- [ ] Decide the final monthly Pro price and currency.
- [ ] Create separate Stripe test-mode and live-mode Product/recurring Price objects with no trial.
- [ ] Configure `STRIPE_PRICE_PRO_MONTHLY` separately for test and live environments.
- [ ] Store the live `STRIPE_SECRET_KEY` only in the API production environment.
- [ ] Configure the Stripe Customer Portal for subscription cancellation, payment-method updates,
  and invoice access.
- [ ] Decide whether Stripe Automatic Tax is required, complete its business-origin setup if used,
  and set `STRIPE_AUTOMATIC_TAX_ENABLED` accordingly.
- [ ] Deploy the API publicly over HTTPS before registering the live webhook.
- [ ] Add the production webhook endpoint in Stripe Dashboard:

  ```text
  https://<api-domain>/api/v1/stripe/webhook
  ```

- [ ] Subscribe the production webhook to:

  ```text
  checkout.session.completed
  checkout.session.async_payment_succeeded
  checkout.session.async_payment_failed
  customer.subscription.created
  customer.subscription.updated
  customer.subscription.deleted
  ```

- [ ] Store the live endpoint signing secret as `STRIPE_WEBHOOK_SECRET`. Do not reuse the Stripe CLI
  or test-mode signing secret.
- [ ] Confirm that only webhook state grants or revokes Pro; a frontend success redirect must not
  change entitlement.
- [ ] Run a complete Stripe test-mode flow through the deployed stack: checkout, duplicate event,
  delayed/out-of-order event, successful renewal, `past_due`, recovery to `active`, scheduled
  cancellation, immediate cancellation, account deletion, API/DB failure, and webhook replay.
- [ ] Verify that an unknown active Price ID fails visibly and is retried instead of silently
  granting or revoking access.
- [ ] Reconcile existing Stripe Customers/subscriptions before enabling new checkout traffic.
- [ ] Configure Stripe Dashboard email notifications and an operator procedure for failed webhook
  deliveries and `BILLING_RECONCILIATION_REQUIRED`.
- [ ] Perform one controlled live-mode low-value purchase only after legal, database, and deployment
  blockers are closed.

### 6. Authentication and transactional email

- [ ] Choose an SMTP-capable transactional email provider.
- [ ] Verify a dedicated sending domain/address and configure SPF, DKIM, and DMARC.
- [ ] Configure custom SMTP in Supabase; do not rely on the development sender.
- [ ] Keep the password-recovery template based on `{{ .Token }}` and test expiry, resend, invalid
  code, and delivery to a normal external mailbox.
- [ ] Configure production Google OAuth origins and callback URLs for both locales.
- [ ] Verify registration confirmation, login, logout, password recovery, password change, and
  account deletion in the deployed environment.
- [ ] Remove the unsupported GitHub OAuth option from the application UI and production config.
- [ ] Verify Supabase rate limits and leaked-password protection settings available on the chosen
  plan.

### 7. Legal, pricing, and truthful product copy

Legal implementation remains intentionally last, but it is still a release blocker for accepting
real consumer payments.

- [ ] Confirm the legal operator/company name, address, registration/tax identifiers, support
  email, and governing jurisdiction.
- [ ] Obtain appropriate legal review for EU/Polish consumer rules, the 14-day withdrawal right,
  immediate digital-service performance, cancellation, refund handling, and account deletion.
- [ ] Decide and document the refund policy. The current technical account-deletion path cancels
  immediately without creating a refund or proration.
- [ ] Define VAT handling and confirm whether displayed consumer prices include VAT.
- [ ] Replace placeholders in Terms and Privacy pages and provide correct EN and PL versions.
- [ ] Ensure Checkout collects any legally required express consent before immediate digital access.
- [ ] Remove the free-trial promise because the confirmed product has no trial.
- [ ] Remove hardcoded `€12` values and render only the confirmed configuration-driven price.
- [ ] Remove or substantiate claims such as `3,850+ questions`, `12K+ engineers`, `18k+ learners`,
  `120+ companies`, community, and priority support.
- [ ] Decide how Vercel Speed Insights affects privacy/consent text, or remove it.
- [ ] Publish working support, privacy, terms, refund/cancellation, and contact links.

## P1 Reliability and Product Polish

### 8. CI and quality gates

- [ ] Add CI for a clean `pnpm install --frozen-lockfile`.
- [ ] Run formatting, lint, sequential database/API/web type checks, API tests, and production builds
  in CI.
- [ ] Fix the six current web lint warnings instead of weakening `--max-warnings 0`.
- [ ] Fix Prisma formatting configuration so the root formatting check can run consistently.
- [ ] Remove the Turbo/Prisma generated-client race from the root type-check workflow.
- [ ] Add a disposable PostgreSQL migration replay job.
- [ ] Add a small browser smoke suite for signup/login, question access, checkout redirect, Billing
  Portal, and account deletion; do not attempt to test every visual component.
- [ ] Build and start the produced Docker images in CI or a staging deployment.

### 9. User-owned data correctness

- [ ] Replace the bookmark toggle endpoint with explicit idempotent create/delete semantics.
- [ ] Stop treating persisted Zustand/localStorage bookmark state as authoritative.
- [ ] Load bookmark state from the authenticated API and roll back optimistic changes on failure.
- [ ] Replace the view-only `Attempt` workaround with an explicit per-user question-progress model
  if the confirmed product still requires view counts and latest assessment.
- [ ] Verify saved/recent data across browsers and devices.
- [ ] Review the distributed account-deletion sequence for partial Supabase/database failures and
  define an operator recovery procedure.

### 10. Operations, backup, and security hardening

- [ ] Configure automatic daily application-database backups to meet the confirmed RPO of 24 hours.
- [ ] Perform a real restore test and document the steps needed to meet the four-hour RTO.
- [ ] Confirm Supabase backup coverage and retention instead of assuming the plan defaults are
  sufficient.
- [ ] Add structured production logs and propagate a request/correlation ID.
- [ ] Define log retention and ensure secrets, authorization headers, cookies, OTPs, and personal
  data are not logged.
- [ ] Configure external uptime checks for web, API liveness, and API readiness.
- [ ] Add rate limiting for auth-adjacent endpoints, account deletion, checkout, search, and
  sensitive mutations.
- [ ] Add and verify CSP, HSTS, frame, MIME-sniffing, and referrer security headers at Caddy or the
  applications.
- [ ] Configure alerts or a manual daily review for failed Stripe webhooks, failed deployments,
  failed migrations, disk pressure, and backup failures.
- [ ] Write a short incident runbook with owners, rollback commands, Supabase/Stripe links, and
  customer-support response steps.
- [ ] Decide analytics and external error-tracking providers later; do not silently add a vendor
  before the deferred product decision is made.

### 11. Content and user-experience polish

- [ ] Decide the final public brand and replace `PrepCode` only after that decision.
- [ ] Replace the root/web/CMS starter READMEs with actual setup, architecture, and operations docs.
- [ ] Publish a small reviewed set of English questions; quality matters more than an arbitrary
  count.
- [ ] Verify empty, loading, error, retry, unauthorized, locked, and not-found states on desktop and
  mobile.
- [ ] Prevent network/API failures from appearing as legitimate empty datasets.
- [ ] Remove presentation-only notification controls or clearly label them unavailable.
- [ ] Remove or clearly separate mocked dashboard statistics, streaks, calendars, and
  recommendations from production data.
- [ ] Audit locale-aware links and remaining hardcoded EN/PL strings.
- [ ] Run keyboard, focus, screen-reader-label, contrast, and reduced-motion checks on core flows.

## Staging and Launch Sequence

### Staging gate

- [ ] Deploy the release candidate to a production-like staging environment.
- [ ] Use separate non-production Supabase and Stripe test-mode credentials.
- [ ] Verify DNS/TLS, CORS, cookies, OAuth redirects, SMTP, migrations, health checks, and backups.
- [ ] Run the critical browser and Stripe flows from a clean user account.
- [ ] Test at least one mobile browser and the supported desktop browsers.
- [ ] Record all critical/high defects and close them before the beta.

### Closed beta gate

- [ ] Invite a small controlled user group before public release.
- [ ] Provide a working support/contact path.
- [ ] Observe authentication, email delivery, API errors, database load, and Stripe test-mode events.
- [ ] Fix all critical and high-severity defects.
- [ ] Confirm the three-person operator rotation and access to VPS, Supabase, Stripe, DNS, SMTP, and
  backups.

### Public/live-payment go/no-go

- [ ] Database migration and restore procedures are proven.
- [ ] Paid-content access tests pass.
- [ ] Production infrastructure and rollback are proven.
- [ ] Live Stripe keys, Price ID, Portal, and webhook are configured.
- [ ] SMTP, OAuth, and account recovery work from the public domains.
- [ ] Legal pages, price, VAT presentation, consent, and refund/cancellation policy are approved.
- [ ] No unresolved critical or high-severity defects remain.
- [ ] The owner explicitly approves enabling live Stripe payments and public access.

## Deferred Decisions That Must Stay Explicit

- Final public brand.
- Final monthly Pro price and currency.
- Public `verified` question policy.
- Refund and `past_due` customer communication details beyond the confirmed access suspension.
- Product analytics provider.
- External error-tracking provider.
- Automatic Payload-to-application publication.
- Future question-content localization model.

## Checklist Maintenance

Update this file whenever a release task is discovered, completed, invalidated, or moved. When
checking an item, add concise evidence where useful: commit/PR, deployment date, migration ID,
environment, or verification command. Do not mark an item complete merely because it exists on an
unmerged branch or passed only with a fake external service.

Primary context sources:

- `docs/PLAN.md` — product decisions and roadmap boundaries.
- `docs/audit.md` — commercial-readiness audit snapshot; some Stripe and dependency findings are
  now partially stale and must be interpreted against the current branch.
- `docs/TODO_SUPABASE_EMAIL_DELIVERY.md` — SMTP work.
- `docs/SUPABASE_PASSWORD_RECOVERY_OTP_SETUP.md` — password-recovery configuration.
- `apps/api/src/stripe/README.md` — Stripe implementation, migration, and test details.
