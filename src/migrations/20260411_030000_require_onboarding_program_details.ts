import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_instructor_program_submissions_is_first_time_program') THEN
      CREATE TYPE "public"."enum_instructor_program_submissions_is_first_time_program" AS ENUM('yes', 'no');
    END IF;
  END $$;

  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ADD COLUMN IF NOT EXISTS "previous_trainees_count" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ADD COLUMN IF NOT EXISTS "is_first_time_program" "enum_instructor_program_submissions_is_first_time_program" DEFAULT 'yes' NOT NULL;
  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ADD COLUMN IF NOT EXISTS "teaching_experience_years" numeric DEFAULT 0 NOT NULL;
  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ADD COLUMN IF NOT EXISTS "delivery_history_text" varchar DEFAULT '' NOT NULL;

  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "course_revenue_share" SET DEFAULT 30;
  UPDATE "instructors"
    SET "course_revenue_share" = 30
    WHERE "course_revenue_share" IS NULL;

  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "agreement_version" SET DEFAULT 'v1.1';
  UPDATE "instructors"
    SET "agreement_version" = 'v1.1'
    WHERE "agreement_version" IS NULL OR "agreement_version" = '';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "course_revenue_share" SET DEFAULT 33;
  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "agreement_version" SET DEFAULT 'v1.0';
  `)
}
