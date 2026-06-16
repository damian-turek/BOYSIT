/*
  Warnings:

  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `technologies` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `technologies` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `proUntil` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "technologies" DROP CONSTRAINT "technologies_categoryId_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "technologies" DROP COLUMN "categoryId",
DROP COLUMN "createdAt",
ADD COLUMN     "category_id" UUID,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "createdAt",
DROP COLUMN "proUntil",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "pro_until" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "bookmarks_question_id_idx" ON "bookmarks"("question_id");

-- CreateIndex
CREATE INDEX "question_tags_tag_id_idx" ON "question_tags"("tag_id");

-- CreateIndex
CREATE INDEX "questions_question_type_idx" ON "questions"("question_type");

-- CreateIndex
CREATE INDEX "questions_verified_idx" ON "questions"("verified");

-- CreateIndex
CREATE INDEX "technologies_category_id_idx" ON "technologies"("category_id");

-- AddForeignKey
ALTER TABLE "technologies" ADD CONSTRAINT "technologies_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
