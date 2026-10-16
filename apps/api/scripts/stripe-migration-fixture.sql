INSERT INTO users (id, email, updated_at)
VALUES ('00000000-0000-4000-8000-000000000001', 'stripe-migration@example.test', CURRENT_TIMESTAMP);
INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, status, updated_at)
VALUES ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001',
  'cus_before_migration', 'sub_before_migration', 'canceled', CURRENT_TIMESTAMP);
