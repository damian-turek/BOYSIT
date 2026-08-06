CREATE INDEX "job_applications_user_id_updated_at_idx"
  ON "job_applications"("user_id", "updated_at");

CREATE INDEX "job_applications_user_id_applied_at_idx"
  ON "job_applications"("user_id", "applied_at");

CREATE INDEX "job_applications_user_id_follow_up_at_idx"
  ON "job_applications"("user_id", "follow_up_at");

CREATE INDEX "job_applications_user_id_company_idx"
  ON "job_applications"("user_id", "company");

CREATE INDEX "job_application_status_events_job_application_id_created_at_idx"
  ON "job_application_status_events"("job_application_id", "created_at");
