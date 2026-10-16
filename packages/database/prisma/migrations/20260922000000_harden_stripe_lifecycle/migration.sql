BEGIN;

-- Do not silently choose an owner/customer when historical data is ambiguous.
DO $$
BEGIN
  IF EXISTS (
    SELECT user_id FROM subscriptions WHERE stripe_customer_id IS NOT NULL
    GROUP BY user_id HAVING COUNT(DISTINCT stripe_customer_id) > 1
  ) THEN
    RAISE EXCEPTION 'Multiple Stripe customers for one user: reconcile billing data before migrating';
  END IF;
END $$;

ALTER TYPE "SubscriptionStatus" ADD VALUE 'paused';

CREATE TABLE billing_accounts (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  customer_request_started_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO billing_accounts (user_id, stripe_customer_id)
SELECT user_id, MIN(stripe_customer_id) FROM subscriptions
WHERE stripe_customer_id IS NOT NULL GROUP BY user_id;

DROP INDEX subscriptions_stripe_customer_id_key;
CREATE INDEX subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);

CREATE TABLE stripe_checkout_attempts (
  id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES billing_accounts(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
  stripe_checkout_session_id TEXT UNIQUE,
  price_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  success_url TEXT NOT NULL,
  cancel_url TEXT NOT NULL,
  automatic_tax BOOLEAN NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX stripe_checkout_attempts_user_id_created_at_idx
  ON stripe_checkout_attempts(user_id, created_at);

-- Rows are committed only together with successful subscription/access updates.
CREATE TABLE stripe_webhook_events (
  event_id TEXT NOT NULL PRIMARY KEY,
  type TEXT NOT NULL,
  stripe_created_at TIMESTAMP(3) NOT NULL,
  processed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
