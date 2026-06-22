CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  CREATE TYPE "Difficulty" AS ENUM ('junior', 'middle', 'senior');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "QuestionType" AS ENUM (
    'theory',
    'practical',
    'code',
    'system_design',
    'troubleshooting'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AccessLevel" AS ENUM ('free', 'pro');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "UserPlan" AS ENUM ('free', 'pro', 'admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "SubscriptionStatus" AS ENUM (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL,
  "name" TEXT,
  "auth_provider_id" TEXT,
  "plan" "UserPlan" NOT NULL DEFAULT 'free',
  "pro_until" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "technologies" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "category_id" UUID,

  CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "question_text" TEXT NOT NULL,
  "answer_text" TEXT,
  "explanation" TEXT,
  "code_snippet" TEXT,
  "difficulty" "Difficulty" NOT NULL,
  "question_type" "QuestionType" NOT NULL,
  "access_level" "AccessLevel" NOT NULL DEFAULT 'free',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "category_id" UUID,
  "technology_id" UUID,

  CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tags" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,

  CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_tags" (
  "question_id" UUID NOT NULL,
  "tag_id" UUID NOT NULL,

  CONSTRAINT "question_tags_pkey" PRIMARY KEY ("question_id", "tag_id")
);

CREATE TABLE "attempts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  "user_answer" TEXT,
  "score" INTEGER,
  "feedback" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookmarks" (
  "user_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("user_id", "question_id")
);

CREATE TABLE "subscriptions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "stripe_customer_id" TEXT,
  "stripe_subscription_id" TEXT,
  "stripe_price_id" TEXT,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'incomplete',
  "current_period_end" TIMESTAMP(3),
  "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "users"("auth_provider_id");

CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

CREATE UNIQUE INDEX "technologies_name_key" ON "technologies"("name");
CREATE UNIQUE INDEX "technologies_slug_key" ON "technologies"("slug");
CREATE INDEX "technologies_category_id_idx" ON "technologies"("category_id");

CREATE UNIQUE INDEX "questions_slug_key" ON "questions"("slug");
CREATE INDEX "questions_category_id_idx" ON "questions"("category_id");
CREATE INDEX "questions_technology_id_idx" ON "questions"("technology_id");
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");
CREATE INDEX "questions_question_type_idx" ON "questions"("question_type");
CREATE INDEX "questions_access_level_idx" ON "questions"("access_level");
CREATE INDEX "questions_is_active_idx" ON "questions"("is_active");
CREATE INDEX "questions_verified_idx" ON "questions"("verified");

CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

CREATE INDEX "question_tags_tag_id_idx" ON "question_tags"("tag_id");

CREATE INDEX "attempts_user_id_idx" ON "attempts"("user_id");
CREATE INDEX "attempts_question_id_idx" ON "attempts"("question_id");
CREATE INDEX "attempts_created_at_idx" ON "attempts"("created_at");

CREATE INDEX "bookmarks_question_id_idx" ON "bookmarks"("question_id");

CREATE UNIQUE INDEX "subscriptions_stripe_customer_id_key" ON "subscriptions"("stripe_customer_id");
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");
CREATE INDEX "subscriptions_user_id_idx" ON "subscriptions"("user_id");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

ALTER TABLE "technologies"
  ADD CONSTRAINT "technologies_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "questions"
  ADD CONSTRAINT "questions_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "questions"
  ADD CONSTRAINT "questions_technology_id_fkey"
  FOREIGN KEY ("technology_id") REFERENCES "technologies"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "question_tags"
  ADD CONSTRAINT "question_tags_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "questions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_tags"
  ADD CONSTRAINT "question_tags_tag_id_fkey"
  FOREIGN KEY ("tag_id") REFERENCES "tags"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attempts"
  ADD CONSTRAINT "attempts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "attempts"
  ADD CONSTRAINT "attempts_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "questions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmarks"
  ADD CONSTRAINT "bookmarks_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bookmarks"
  ADD CONSTRAINT "bookmarks_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "questions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "subscriptions"
  ADD CONSTRAINT "subscriptions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
