import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Users table — add Google Calendar integration columns
  //    These fields exist in Users.ts but were never migrated.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "users"
    ADD COLUMN IF NOT EXISTS "google_refresh_token" varchar,
    ADD COLUMN IF NOT EXISTS "google_access_token" varchar,
    ADD COLUMN IF NOT EXISTS "google_calendar_connected_at" timestamp(3) with time zone,
    ADD COLUMN IF NOT EXISTS "google_calendar_email" varchar,
    ADD COLUMN IF NOT EXISTS "google_calendar_id" varchar;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Programs enum — add 'camp' value to enum_programs_type
  //    Original enum: ('workshop', 'course', 'webinar')
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  DO $$ BEGIN
    ALTER TYPE "public"."enum_programs_type" ADD VALUE IF NOT EXISTS 'camp';
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ConsultationTypes — add advanced scheduling columns
  //    bufferBefore, bufferAfter, maxPerDay, startTimeIncrement,
  //    minNoticeHours, minCancelNoticeHours were added but never migrated.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_types"
    ADD COLUMN IF NOT EXISTS "buffer_before" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "buffer_after" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "max_per_day" numeric,
    ADD COLUMN IF NOT EXISTS "start_time_increment" numeric DEFAULT 30,
    ADD COLUMN IF NOT EXISTS "min_notice_hours" numeric DEFAULT 24,
    ADD COLUMN IF NOT EXISTS "min_cancel_notice_hours" numeric DEFAULT 72;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ConsultationTypes — availableDays (hasMany select → sub-table)
  //    Payload stores hasMany selects in a separate table.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_consultation_types_available_days') THEN
      CREATE TYPE "public"."enum_consultation_types_available_days" AS ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
    END IF;
  END $$;
  `)

  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "consultation_types_available_days" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" "enum_consultation_types_available_days"
  );
  `)

  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'consultation_types_available_days_parent_id_fk') THEN
      ALTER TABLE "consultation_types_available_days"
      ADD CONSTRAINT "consultation_types_available_days_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."consultation_types"("id")
      ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  `)

  await db.execute(sql`
  CREATE INDEX IF NOT EXISTS "consultation_types_available_days_order_idx"
    ON "consultation_types_available_days" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "consultation_types_available_days_parent_id_idx"
    ON "consultation_types_available_days" USING btree ("_parent_id");
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 5. UpcomingEventsConfig (global) — ensure table exists
  //    This is a Payload global, stored in a single-row table.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_upcoming_events_config_display_format') THEN
      CREATE TYPE "public"."enum_upcoming_events_config_display_format" AS ENUM('grid', 'carousel', 'list');
    END IF;
  END $$;
  `)

  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "upcoming_events_config" (
    "id" serial PRIMARY KEY NOT NULL,
    "heading_ar" varchar DEFAULT 'الفعاليات القادمة',
    "heading_en" varchar DEFAULT 'Upcoming Events',
    "subheading_ar" varchar,
    "subheading_en" varchar,
    "display_format" "enum_upcoming_events_config_display_format" DEFAULT 'carousel',
    "max_display" numeric DEFAULT 6,
    "show_past_events" boolean DEFAULT false,
    "auto_hide_expired" boolean DEFAULT true,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // 5. Drop upcoming_events_config
  await db.execute(sql`
  DROP TABLE IF EXISTS "upcoming_events_config" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_upcoming_events_config_display_format";
  `)

  // 4. Drop consultation_types_available_days
  await db.execute(sql`
  DROP TABLE IF EXISTS "consultation_types_available_days" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_consultation_types_available_days";
  `)

  // 3. Drop consultation_types scheduling columns
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_types"
    DROP COLUMN IF EXISTS "buffer_before",
    DROP COLUMN IF EXISTS "buffer_after",
    DROP COLUMN IF EXISTS "max_per_day",
    DROP COLUMN IF EXISTS "start_time_increment",
    DROP COLUMN IF EXISTS "min_notice_hours",
    DROP COLUMN IF EXISTS "min_cancel_notice_hours";
  `)

  // 2. enum_programs_type 'camp' — cannot remove enum values in PostgreSQL without recreating

  // 1. Drop Google Calendar columns from users
  await db.execute(sql`
  ALTER TABLE IF EXISTS "users"
    DROP COLUMN IF EXISTS "google_refresh_token",
    DROP COLUMN IF EXISTS "google_access_token",
    DROP COLUMN IF EXISTS "google_calendar_connected_at",
    DROP COLUMN IF EXISTS "google_calendar_email",
    DROP COLUMN IF EXISTS "google_calendar_id";
  `)
}
