import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. FIX consultation_types_available_days column name drift
  //    Migration 20260418_010000 created this table with "_order" and
  //    "_parent_id" (Payload 2 convention), but the current Payload 3
  //    runtime generates queries using "order" and "parent_id".
  //
  //    Steps:
  //    a) Drop existing FK constraint on _parent_id
  //    b) Rename _order → order  AND  _parent_id → parent_id
  //    c) Recreate FK constraint on parent_id
  //    d) Recreate indexes
  // ──────────────────────────────────────────────────────────────────────────

  // a) Drop old FK if it exists (it references _parent_id)
  await db.execute(sql`
  DO $$ BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'consultation_types_available_days_parent_id_fk'
    ) THEN
      ALTER TABLE "consultation_types_available_days"
        DROP CONSTRAINT "consultation_types_available_days_parent_id_fk";
    END IF;
  END $$;
  `)

  // b) Rename columns
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

  // c) Recreate FK constraint on the (now-renamed) parent_id column
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'consultation_types_available_days_parent_id_fk'
    ) THEN
      ALTER TABLE "consultation_types_available_days"
        ADD CONSTRAINT "consultation_types_available_days_parent_id_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."consultation_types"("id")
        ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;
  `)

  // d) Recreate indexes with the correct column names (idempotent)
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
  //    Based on ConsultationBookings.ts field definitions vs what exists.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_bookings"
    ADD COLUMN IF NOT EXISTS "booking_code" varchar,
    ADD COLUMN IF NOT EXISTS "start_time" varchar,
    ADD COLUMN IF NOT EXISTS "end_time" varchar,
    ADD COLUMN IF NOT EXISTS "timezone" varchar DEFAULT 'Africa/Cairo',
    ADD COLUMN IF NOT EXISTS "client_name" varchar,
    ADD COLUMN IF NOT EXISTS "client_email" varchar,
    ADD COLUMN IF NOT EXISTS "amount" numeric,
    ADD COLUMN IF NOT EXISTS "payment_status" varchar DEFAULT 'pending',
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

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Create enum for consultation_bookings status & payment_status
  //    (if not already existing)
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_consultation_bookings_status') THEN
      CREATE TYPE "public"."enum_consultation_bookings_status"
        AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
    END IF;
  END $$;
  `)

  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_consultation_bookings_payment_status') THEN
      CREATE TYPE "public"."enum_consultation_bookings_payment_status"
        AS ENUM('pending', 'paid', 'refunded');
    END IF;
  END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse column renames
  await db.execute(sql`
  DO $$ BEGIN
    -- Drop FK first
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'consultation_types_available_days_parent_id_fk'
    ) THEN
      ALTER TABLE "consultation_types_available_days"
        DROP CONSTRAINT "consultation_types_available_days_parent_id_fk";
    END IF;

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

    -- Re-add FK on _parent_id
    ALTER TABLE "consultation_types_available_days"
      ADD CONSTRAINT "consultation_types_available_days_parent_id_fk"
      FOREIGN KEY ("_parent_id") REFERENCES "public"."consultation_types"("id")
      ON DELETE cascade ON UPDATE no action;
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

  // Remove added columns
  await db.execute(sql`
  ALTER TABLE IF EXISTS "consultation_bookings"
    DROP COLUMN IF EXISTS "booking_date",
    DROP COLUMN IF EXISTS "booking_code",
    DROP COLUMN IF EXISTS "payment_status";
  `)

  // Drop enums
  await db.execute(sql`
  DROP TYPE IF EXISTS "public"."enum_consultation_bookings_status";
  DROP TYPE IF EXISTS "public"."enum_consultation_bookings_payment_status";
  `)
}
