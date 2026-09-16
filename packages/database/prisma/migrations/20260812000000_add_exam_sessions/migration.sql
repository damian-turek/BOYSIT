CREATE TYPE "ExamSessionStatus" AS ENUM (
  'in_progress',
  'review',
  'completed',
  'expired'
);

CREATE TABLE "exam_sessions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "exam_slug" TEXT NOT NULL,
  "status" "ExamSessionStatus" NOT NULL DEFAULT 'in_progress',
  "question_count" INTEGER NOT NULL,
  "duration_minutes" INTEGER NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "submitted_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "exam_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "exam_session_questions" (
  "session_id" UUID NOT NULL,
  "question_id" UUID NOT NULL,
  "position" INTEGER NOT NULL,
  "user_answer" TEXT,
  "saved_at" TIMESTAMP(3),

  CONSTRAINT "exam_session_questions_pkey" PRIMARY KEY ("session_id", "question_id")
);

CREATE INDEX "exam_sessions_user_id_idx" ON "exam_sessions"("user_id");
CREATE INDEX "exam_sessions_user_id_status_idx" ON "exam_sessions"("user_id", "status");
CREATE INDEX "exam_sessions_user_id_created_at_idx" ON "exam_sessions"("user_id", "created_at");
CREATE INDEX "exam_sessions_expires_at_idx" ON "exam_sessions"("expires_at");

CREATE UNIQUE INDEX "exam_session_questions_session_id_position_key"
  ON "exam_session_questions"("session_id", "position");
CREATE INDEX "exam_session_questions_question_id_idx"
  ON "exam_session_questions"("question_id");

ALTER TABLE "exam_sessions"
  ADD CONSTRAINT "exam_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exam_session_questions"
  ADD CONSTRAINT "exam_session_questions_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "exam_sessions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "exam_session_questions"
  ADD CONSTRAINT "exam_session_questions_question_id_fkey"
  FOREIGN KEY ("question_id") REFERENCES "questions"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
