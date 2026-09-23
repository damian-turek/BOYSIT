# Stripe billing hardening

Only an `active` subscription with a configured Pro price grants paid access. Administrators are
excluded from subscription-driven plan updates. A scheduled cancellation retains access while the
subscription remains active. These rules are applied when webhooks are processed; deployment does
not automatically reconcile every existing user.

## Webhooks

The existing signature verification remains the entry boundary. For supported subscription events,
`stripe_webhook_events.event_id` is inserted with conflict handling inside the same transaction as
subscription and user updates. Failed processing rolls back the receipt, allowing Stripe to retry.
Concurrent duplicates wait for the first transaction and either skip its committed receipt or retry
after rollback. Unsupported event types are acknowledged without changing subscription state.

All billing changes lock the user's PostgreSQL row. The handler fetches the customer's current,
paginated subscription state from Stripe **after** obtaining that lock. Event payloads identify the
resource; their historical status is not applied. This also handles different events created in the
same second without treating event timestamps or IDs as ordered versions. All customer subscriptions
are reconciled together, so cancellation of an old subscription cannot remove access from a new one.
An active subscription whose Price ID is not configured fails processing instead of silently
downgrading the user; the transaction rolls back and Stripe can retry after configuration is fixed.

API calls have bounded timeouts/retries; transactions have a 30-second limit. Stripe unavailability
or lock/transaction timeout fails the request and leaves the event available for retry. Holding a DB
connection during Stripe reads is a deliberate initial-scale tradeoff. A durable worker queue can
replace this if webhook volume or latency requires it.

## Checkout and customer ownership

`billing_accounts` owns one unique Stripe Customer per application user. Subscription rows retain
customer IDs as non-unique history. Portal/invoice lookup uses the billing account.

Checkout checks live Stripe subscriptions before creating a purchase, including when local webhook
processing is delayed. All non-terminal subscriptions block a new purchase; `canceled` and
`incomplete_expired` permit another. Existing open sessions are reused. An expired session, or a
completed session whose subscription has ended, allows a new persisted attempt.

The account identity and immutable Checkout attempt parameters are committed before external
creation calls. Customer and Checkout creation use stable Stripe idempotency keys. A timeout, process
restart or failed DB commit retries the same request. Changing locale or price configuration while
an attempt is pending does not mutate its stored Stripe parameters.

An unresolved creation request older than 23 hours is blocked with
`BILLING_RECONCILIATION_REQUIRED`, rather than risking reuse of a pruned Stripe idempotency key.
An operator must identify the customer/session in Stripe via `metadata.userId` or
`metadata.checkoutAttemptId`, verify ownership and persist the corresponding ID before retrying.
Do not simply delete the unresolved attempt or clear its request timestamp. This step intentionally
does not implement a reconciliation admin UI.

## Account and billing UI lifecycle

`GET /stripe/subscription` exposes the stored subscription status, period end and scheduled
cancellation flag for the authenticated billing page. Billing Portal sessions receive a validated
locale-aware return path and combine it only with the trusted `APP_URL`.

After the account-deletion code is verified, all non-terminal subscriptions belonging to the
account's Stripe Customer are canceled immediately with no proration or final invoice. If Stripe is
unavailable, authentication and application records are not deleted, preventing an unowned active
subscription from continuing to charge. A later webhook for that deleted user is acknowledged only
when Stripe confirms that every subscription for the customer is terminal; an active orphan still
fails loudly for operator reconciliation.

## Deployment

1. Back up the application database and validate its migration history independently. Stop the old
   API instances before applying this change; old writers do not honor the new locking/account model.
2. Reconcile existing Stripe subscriptions and expire legacy open subscription Checkout sessions
   before enabling the new Checkout. Old customer-email sessions may have no Customer ID yet and
   cannot reliably be discovered through customer-scoped queries.
3. Apply `20260922000000_harden_stripe_lifecycle` through the normal migration workflow. It backfills
   customer ownership without deleting subscription history. Multiple different customer IDs for
   one user abort the migration and require manual reconciliation; no customer is chosen silently.
4. Generate the Prisma client, deploy all API instances, then replay failed Stripe events as needed.

The API requires the new tables before serving billing traffic. The separate historical migration
baseline problem is not fixed by this change. Downgrading the application without a reviewed data
migration is unsafe once multiple subscription rows use the same Customer ID.

## Tests

Run unit tests with `pnpm --filter api test`. The PostgreSQL suite is skipped unless an explicitly
supplied `STRIPE_TEST_DATABASE_URL` points to a localhost database named `boysit_stripe_test`.

From the repository root, run:

```sh
bash apps/api/scripts/test-stripe-integration.sh
```

Docker and installed workspace dependencies are required. The script creates a disposable
PostgreSQL 17 container on a random loopback port, applies the known application baseline, verifies
the migration's ambiguity guard and data backfill, checks schema parity, and runs integration tests.
It removes the container on exit. The first three broken historical migrations are deliberately
excluded: this verifies the new billing upgrade, not a full production `prisma migrate deploy`.

Integration tests exercise real PostgreSQL transactions, unique constraints, concurrent deliveries,
row locks, rollback/replay and persisted Checkout recovery. Stripe itself is faked; a real Stripe
test-mode end-to-end run remains a separate launch check.

References: [Stripe webhooks](https://docs.stripe.com/webhooks),
[Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).
