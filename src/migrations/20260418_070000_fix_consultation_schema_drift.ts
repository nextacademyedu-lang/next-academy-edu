import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. FIX consultation_types_available_days column name drift
  //    The previous migration (20260418_010000) created this table with
  //    "_order" and "_parent_id" (Payload 2 convention), but the current
  //    Payload 3 runtime generates queries using "order" and "parent_id".
  //    We rename the columns to match what Payload actually queries for.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  DO $$ BEGIN
    -- Rename _order → order (if _order exists and order doesn't)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'consultation_types_available_days' AND column_name = '_order'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'consultation_types_available_days' AND column_name = 'order'
    ) THEN
      ALTER TABLE "consultation_types_available_days" RENAME COLUMN "_order" TO "order";
    END IF;

    -- Rename _parent_id → parent_id (if _parent_id exists and parent_id doesn't)
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'consultation_types_available_days' AND column_name = '_parent_id'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'consultation_types_available_days' AND column_name = 'parent_id'
    ) THEN
      ALTER TABLE "consultation_types_available_days" RENAME COLUMN "_parent_id" TO "parent_id";
    END IF;
  END $$;
  `)

  // Recreate indexes with the correct column names (idempotent)
  await db.execute(sql`
  DROP INDEX IF EXISTS "consultation_types_available_days_order_idx";
  DROP INDEX IF EXISTS "consultation_types_available_days_parent_id_idx";
  CREATE INDEX IF NOT EXISTS "consultation_types_available_days_order_idx"
    ON "consultation_types_available_days" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "consultation_types_available_days_parent_id_idx"
    ON "consultation_types_available_days" USING btree ("parent_id");
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 2. FIX consultation_bookings — add missing "booking_date" column
  //    The collection defines bookingDate (date) but the column was never
  //    created in the production database.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_bookings"
    ADD COLUMN IF NOT EXISTS "booking_date" timestamp(3) with time zone;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 3. FIX consultation_bookings — add other potentially missing columns
  //    Based on ConsultationBookings.ts field definitions vs what exists in DB.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_bookings"
    ADD COLUMN IF NOT EXISTS "start_time" varchar,
    ADD COLUMN IF NOT EXISTS "end_time" varchar,
    ADD COLUMN IF NOT EXISTS "timezone" varchar DEFAULT 'Africa/Cairo',
    ADD COLUMN IF NOT EXISTS "client_name" varchar,
    ADD COLUMN IF NOT EXISTS "client_email" varchar,
    ADD COLUMN IF NOT EXISTS "amount" numeric,
    ADD COLUMN IF NOT EXISTS "transaction_id" varchar,
    ADD COLUMN IF NOT EXISTS "meeting_url" varchar,
    ADD COLUMN IF NOT EXISTS "user_notes" varchar,
    ADD COLUMN IF NOT EXISTS "instructor_notes" varchar,
    ADD COLUMN IF NOT EXISTS "cancelled_by" varchar,
    ADD COLUMN IF NOT EXISTS "cancellation_reason" varchar,
    ADD COLUMN IF NOT EXISTS "reminder_sent" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "discount_code" varchar,
    ADD COLUMN IF NOT EXISTS "discount_amount" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "twenty_crm_deal_id" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse column renames
  await db.execute(sql`
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'consultation_types_available_days' AND column_name = 'order'
    ) THEN
      ALTER TABLE "consultation_types_available_days" RENAME COLUMN "order" TO "_order";
    END IF;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'consultation_types_available_days' AND column_name = 'parent_id'
    ) THEN
      ALTER TABLE "consultation_types_available_days" RENAME COLUMN "parent_id" TO "_parent_id";
    END IF;
  END $$;
  `)

  // Recreate indexes with original names
  await db.execute(sql`
  DROP INDEX IF EXISTS "consultation_types_available_days_order_idx";
  DROP INDEX IF EXISTS "consultation_types_available_days_parent_id_idx";
  CREATE INDEX IF NOT EXISTS "consultation_types_available_days_order_idx"
    ON "consultation_types_available_days" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "consultation_types_available_days_parent_id_idx"
    ON "consultation_types_available_days" USING btree ("_parent_id");
  `)

  // Remove booking_date column
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_bookings"
    DROP COLUMN IF EXISTS "booking_date";
  `)
}
