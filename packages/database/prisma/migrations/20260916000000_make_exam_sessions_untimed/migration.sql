ALTER TABLE "exam_sessions"
  ALTER COLUMN "duration_minutes" DROP NOT NULL,
  ALTER COLUMN "expires_at" DROP NOT NULL;
