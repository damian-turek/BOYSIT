-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('junior', 'middle', 'senior');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('theory', 'practical', 'code', 'system_design', 'troubleshooting');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('free', 'pro');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'pro', 'admin');

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_subscriptionCode_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToTag" DROP CONSTRAINT "_QuestionToTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionToTag" DROP CONSTRAINT "_QuestionToTag_B_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_QuestionToTag";

-- DropEnum
DROP TYPE "DIFFICULTY";

-- DropEnum
DROP TYPE "ROLE";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "plan" "UserPlan" NOT NULL DEFAULT 'free',
    "proUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technologies" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" UUID,

    CONSTRAINT "technologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "answer_text" TEXT,
    "explanation" TEXT,
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

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_tags" (
    "question_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "question_tags_pkey" PRIMARY KEY ("question_id","tag_id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "user_answer" TEXT,
    "score" INTEGER,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "user_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("user_id","question_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "technologies_name_key" ON "technologies"("name");

-- CreateIndex
CREATE INDEX "questions_category_id_idx" ON "questions"("category_id");

-- CreateIndex
CREATE INDEX "questions_technology_id_idx" ON "questions"("technology_id");

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");

-- CreateIndex
CREATE INDEX "questions_access_level_idx" ON "questions"("access_level");

-- CreateIndex
CREATE INDEX "questions_is_active_idx" ON "questions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "attempts_user_id_idx" ON "attempts"("user_id");

-- CreateIndex
CREATE INDEX "attempts_question_id_idx" ON "attempts"("question_id");

-- CreateIndex
CREATE INDEX "attempts_created_at_idx" ON "attempts"("created_at");

-- AddForeignKey
ALTER TABLE "technologies" ADD CONSTRAINT "technologies_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_tags" ADD CONSTRAINT "question_tags_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_tags" ADD CONSTRAINT "question_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
