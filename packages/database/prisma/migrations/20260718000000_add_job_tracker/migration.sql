DO $$
BEGIN
  CREATE TYPE "JobApplicationStatus" AS ENUM (
    'wishlist',
    'applied',
    'phone_screen',
    'technical',
    'final_round',
    'offer',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE "job_applications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "company" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "location" TEXT,
  "salary" TEXT,
  "job_url" TEXT,
  "status" "JobApplicationStatus" NOT NULL DEFAULT 'wishlist',
  "note" TEXT,
  "custom_technologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "applied_at" TIMESTAMP(3),
  "follow_up_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "job_application_technologies" (
  "job_application_id" UUID NOT NULL,
  "technology_id" UUID NOT NULL,

  CONSTRAINT "job_application_technologies_pkey" PRIMARY KEY ("job_application_id", "technology_id")
);

CREATE TABLE "job_application_status_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "job_application_id" UUID NOT NULL,
  "from_status" "JobApplicationStatus",
  "to_status" "JobApplicationStatus" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "job_application_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "job_applications_user_id_idx" ON "job_applications"("user_id");
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");
CREATE INDEX "job_applications_applied_at_idx" ON "job_applications"("applied_at");
CREATE INDEX "job_applications_follow_up_at_idx" ON "job_applications"("follow_up_at");
CREATE INDEX "job_applications_user_id_status_idx" ON "job_applications"("user_id", "status");

CREATE INDEX "job_application_technologies_technology_id_idx"
  ON "job_application_technologies"("technology_id");

CREATE INDEX "job_application_status_events_job_application_id_idx"
  ON "job_application_status_events"("job_application_id");
CREATE INDEX "job_application_status_events_to_status_idx"
  ON "job_application_status_events"("to_status");
CREATE INDEX "job_application_status_events_created_at_idx"
  ON "job_application_status_events"("created_at");

ALTER TABLE "job_applications"
  ADD CONSTRAINT "job_applications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_application_technologies"
  ADD CONSTRAINT "job_application_technologies_job_application_id_fkey"
  FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_application_technologies"
  ADD CONSTRAINT "job_application_technologies_technology_id_fkey"
  FOREIGN KEY ("technology_id") REFERENCES "technologies"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_application_status_events"
  ADD CONSTRAINT "job_application_status_events_job_application_id_fkey"
  FOREIGN KEY ("job_application_id") REFERENCES "job_applications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
