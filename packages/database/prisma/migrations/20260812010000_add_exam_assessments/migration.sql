CREATE TYPE "Assessment" AS ENUM ('know', 'partial', 'dont_know');

ALTER TABLE "attempts"
  ADD COLUMN "assessment" "Assessment";

ALTER TABLE "exam_session_questions"
  ADD COLUMN "attempt_id" UUID;

CREATE UNIQUE INDEX "exam_session_questions_attempt_id_key"
  ON "exam_session_questions"("attempt_id");

ALTER TABLE "exam_session_questions"
  ADD CONSTRAINT "exam_session_questions_attempt_id_fkey"
  FOREIGN KEY ("attempt_id") REFERENCES "attempts"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
