import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Instructors
    ALTER TABLE IF EXISTS "instructors"
      ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;

    ALTER TABLE IF EXISTS "instructors"
      ADD COLUMN IF NOT EXISTS "agreement_accepted" boolean DEFAULT false;

    ALTER TABLE IF EXISTS "instructors"
      ADD COLUMN IF NOT EXISTS "agreement_accepted_at" timestamp(3) with time zone;

    ALTER TABLE IF EXISTS "instructors"
      ADD COLUMN IF NOT EXISTS "agreement_version" varchar DEFAULT 'v1.2';

    ALTER TABLE IF EXISTS "instructors"
      ADD COLUMN IF NOT EXISTS "course_revenue_share" numeric DEFAULT 33;

    ALTER TABLE IF EXISTS "instructors"
      ADD COLUMN IF NOT EXISTS "consultation_revenue_share" numeric DEFAULT 50;

    -- Bookings
    ALTER TABLE IF EXISTS "bookings"
      ADD COLUMN IF NOT EXISTS "event_id" integer;

    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_event_id_events_id_fk') THEN
        ALTER TABLE "bookings"
        ADD CONSTRAINT "bookings_event_id_events_id_fk"
        FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "bookings_event_idx" ON "bookings" USING btree ("event_id");

    -- Instructor program submissions
    ALTER TABLE IF EXISTS "instructor_program_submissions"
      ADD COLUMN IF NOT EXISTS "rounds_count" numeric DEFAULT 1;

    UPDATE "instructor_program_submissions"
      SET "rounds_count" = 1
      WHERE "rounds_count" IS NULL;

    ALTER TABLE IF EXISTS "instructor_program_submissions"
      ALTER COLUMN "rounds_count" SET DEFAULT 1;

    ALTER TABLE IF EXISTS "instructor_program_submissions"
      ALTER COLUMN "rounds_count" SET NOT NULL;

    -- Locked-documents relation columns (prevent runtime parser errors after schema drift)
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "users_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "media_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "companies_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "user_profiles_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tags_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "categories_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "instructors_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "programs_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "events_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "rounds_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "sessions_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "payment_plans_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "bookings_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "payments_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "installment_requests_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "notifications_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "discount_codes_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "consultation_types_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "consultation_availability_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "consultation_slots_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "consultation_bookings_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "leads_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "waitlist_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "reviews_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "certificates_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "payment_links_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "instructor_blocked_dates_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "verification_codes_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "blog_posts_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "bulk_seat_allocations_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "popups_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "announcement_bars_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "upcoming_events_config_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "crm_sync_events_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "partners_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "instructor_program_submissions_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "instructor_agreements_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_invitations_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_groups_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_group_members_id" integer;
    ALTER TABLE IF EXISTS "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_policies_id" integer;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Intentionally no-op: this is a repair migration for production drift.
}
