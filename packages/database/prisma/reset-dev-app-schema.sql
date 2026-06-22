-- Development-only cleanup for the BOYSIT app database.
-- Use this only when the Supabase database does not contain production/user data.
-- It removes the app-owned schema objects so Prisma can replay the baseline migration.

DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "bookmarks" CASCADE;
DROP TABLE IF EXISTS "attempts" CASCADE;
DROP TABLE IF EXISTS "question_tags" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "questions" CASCADE;
DROP TABLE IF EXISTS "technologies" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "UserPlan" CASCADE;
DROP TYPE IF EXISTS "AccessLevel" CASCADE;
DROP TYPE IF EXISTS "QuestionType" CASCADE;
DROP TYPE IF EXISTS "Difficulty" CASCADE;
