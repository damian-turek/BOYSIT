#!/usr/bin/env bash
set -euo pipefail

stripeTestRoot="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$stripeTestRoot"
stripeTestContainer=''
cleanup() {
  if [[ -n "$stripeTestContainer" ]]; then
    docker stop "$stripeTestContainer" >/dev/null
  fi
}
trap cleanup EXIT

stripeTestContainer="$(docker run --rm --detach \
  --name "boysit-stripe-tests-$$" --label boysit.task=stripe-lifecycle \
  --env POSTGRES_USER=stripe_test --env POSTGRES_PASSWORD=stripe_test_local_only \
  --env POSTGRES_DB=boysit_stripe_test --publish 127.0.0.1::5432 postgres:17-alpine)"

for attempt in {1..30}; do
  if docker exec "$stripeTestContainer" pg_isready -U stripe_test -d boysit_stripe_test >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

stripeTestBinding="$(docker port "$stripeTestContainer" 5432/tcp)"
export STRIPE_TEST_DATABASE_URL="postgresql://stripe_test:stripe_test_local_only@127.0.0.1:${stripeTestBinding##*:}/boysit_stripe_test"
export DIRECT_URL="$STRIPE_TEST_DATABASE_URL"
export DATABASE_URL="$STRIPE_TEST_DATABASE_URL"

sql() {
  docker exec -i "$stripeTestContainer" psql -X -v ON_ERROR_STOP=1 -U stripe_test -d boysit_stripe_test "$@"
}

# The first three historical migrations are inconsistent. This is an isolated upgrade test
# from the current app baseline, NOT a claim that the full migrate-deploy chain is repaired.
for migration in \
  20260620000000_init_app_database \
  20260718000000_add_job_tracker \
  20260806000000_add_job_tracker_query_indexes \
  20260812000000_add_exam_sessions \
  20260812010000_add_exam_assessments \
  20260916000000_make_exam_sessions_untimed; do
  sql < "packages/database/prisma/migrations/$migration/migration.sql" >/dev/null
done
sql < apps/api/scripts/stripe-migration-fixture.sql >/dev/null

# Ambiguous customer history must abort without changing the existing records or schema.
sql -c "INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, status, updated_at) VALUES ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'cus_ambiguous', 'sub_ambiguous', 'canceled', CURRENT_TIMESTAMP)" >/dev/null
if sql < packages/database/prisma/migrations/20260922000000_harden_stripe_lifecycle/migration.sql; then
  echo 'ERROR: ambiguous customer history was accepted' >&2
  exit 1
fi
stripeTestRollback="$(sql -Atc "SELECT to_regclass('billing_accounts') IS NULL AND (SELECT COUNT(*) FROM subscriptions) = 2")"
[[ "$stripeTestRollback" == 't' ]]
sql -c "DELETE FROM subscriptions WHERE id = '00000000-0000-4000-8000-000000000003'" >/dev/null
sql < packages/database/prisma/migrations/20260922000000_harden_stripe_lifecycle/migration.sql

pnpm --filter database build
pnpm --filter database exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
pnpm --filter api test -- src/stripe/stripe.integration.spec.ts
