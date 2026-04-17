import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Bookings — lifecycle & abandoned-cart tracking fields
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "bookings"
    ADD COLUMN IF NOT EXISTS "reminder_sent24h" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "reminder_sent1h" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "cart_recovery1h_sent" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "cart_recovery24h_sent" boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS "checkout_started_at" timestamp(3) with time zone,
    ADD COLUMN IF NOT EXISTS "cancelled_at" timestamp(3) with time zone,
    ADD COLUMN IF NOT EXISTS "cancellation_reason" varchar,
    ADD COLUMN IF NOT EXISTS "booking_type" varchar DEFAULT 'b2c',
    ADD COLUMN IF NOT EXISTS "refund_amount" numeric,
    ADD COLUMN IF NOT EXISTS "refund_date" timestamp(3) with time zone;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Payments — financial tracking & reconciliation fields
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "payments"
    ADD COLUMN IF NOT EXISTS "receipt_url" varchar,
    ADD COLUMN IF NOT EXISTS "receipt_number" varchar,
    ADD COLUMN IF NOT EXISTS "net_amount" numeric,
    ADD COLUMN IF NOT EXISTS "gateway_fee" numeric,
    ADD COLUMN IF NOT EXISTS "currency" varchar DEFAULT 'EGP',
    ADD COLUMN IF NOT EXISTS "reconciliation_status" varchar DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS "reminder_sent_count" numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "last_reminder_sent" timestamp(3) with time zone;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Create enum for booking_type if it doesn't exist (for select validation)
  // ──────────────────────────────────────────────────────────────────────────
  // Payload uses varchar for selects, no enum needed.

  // ──────────────────────────────────────────────────────────────────────────
  // 4. RefundRequests — new collection table
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "refund_requests" (
    "id" serial PRIMARY KEY NOT NULL,
    "booking_id" integer NOT NULL,
    "payment_id" integer NOT NULL,
    "requested_by_id" integer NOT NULL,
    "amount" numeric NOT NULL,
    "reason" varchar NOT NULL,
    "status" varchar DEFAULT 'pending' NOT NULL,
    "approved_by_id" integer,
    "gateway_refund_id" varchar,
    "processed_at" timestamp(3) with time zone,
    "admin_notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  `)

  // Add indexes for refund_requests
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'refund_requests_booking_idx') THEN
      CREATE INDEX "refund_requests_booking_idx" ON "refund_requests" USING btree ("booking_id");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'refund_requests_payment_idx') THEN
      CREATE INDEX "refund_requests_payment_idx" ON "refund_requests" USING btree ("payment_id");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'refund_requests_requested_by_idx') THEN
      CREATE INDEX "refund_requests_requested_by_idx" ON "refund_requests" USING btree ("requested_by_id");
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'refund_requests_created_at_idx') THEN
      CREATE INDEX "refund_requests_created_at_idx" ON "refund_requests" USING btree ("created_at");
    END IF;
  END $$;
  `)

  // Add foreign keys for refund_requests
  await db.execute(sql`
  DO $$ BEGIN
    ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    ALTER TABLE "refund_requests" ADD CONSTRAINT "refund_requests_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 5. payload_locked_documents_rels — add refund_requests FK column
  //    Payload auto-generates this column for each collection in the rels table.
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    ADD COLUMN IF NOT EXISTS "refund_requests_id" integer;
  `)

  // Add FK constraint
  await db.execute(sql`
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_refund_requests_fk" FOREIGN KEY ("refund_requests_id") REFERENCES "refund_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;
  `)

  // Add index for the new rels column
  await db.execute(sql`
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'payload_locked_documents_rels_refund_requests_id_idx') THEN
      CREATE INDEX "payload_locked_documents_rels_refund_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("refund_requests_id");
    END IF;
  END $$;
  `)

  // ──────────────────────────────────────────────────────────────────────────
  // 6. payload_preferences_rels — add refund_requests FK column
  // ──────────────────────────────────────────────────────────────────────────
  await db.execute(sql`
  ALTER TABLE IF EXISTS "payload_preferences_rels"
    ADD COLUMN IF NOT EXISTS "refund_requests_id" integer;
  `)

  await db.execute(sql`
  DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_refund_requests_fk" FOREIGN KEY ("refund_requests_id") REFERENCES "refund_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Drop refund_requests FK columns from Payload internal tables
  await db.execute(sql`
  ALTER TABLE IF EXISTS "payload_preferences_rels"
    DROP COLUMN IF EXISTS "refund_requests_id";
  ALTER TABLE IF EXISTS "payload_locked_documents_rels"
    DROP COLUMN IF EXISTS "refund_requests_id";
  `)

  // Drop refund_requests table
  await db.execute(sql`
  DROP TABLE IF EXISTS "refund_requests";
  `)

  // Drop Payments financial columns
  await db.execute(sql`
  ALTER TABLE IF EXISTS "payments"
    DROP COLUMN IF EXISTS "receipt_url",
    DROP COLUMN IF EXISTS "receipt_number",
    DROP COLUMN IF EXISTS "net_amount",
    DROP COLUMN IF EXISTS "gateway_fee",
    DROP COLUMN IF EXISTS "currency",
    DROP COLUMN IF EXISTS "reconciliation_status",
    DROP COLUMN IF EXISTS "reminder_sent_count",
    DROP COLUMN IF EXISTS "last_reminder_sent";
  `)

  // Drop Bookings lifecycle columns
  await db.execute(sql`
  ALTER TABLE IF EXISTS "bookings"
    DROP COLUMN IF EXISTS "reminder_sent24h",
    DROP COLUMN IF EXISTS "reminder_sent1h",
    DROP COLUMN IF EXISTS "cart_recovery1h_sent",
    DROP COLUMN IF EXISTS "cart_recovery24h_sent",
    DROP COLUMN IF EXISTS "checkout_started_at",
    DROP COLUMN IF EXISTS "cancelled_at",
    DROP COLUMN IF EXISTS "cancellation_reason",
    DROP COLUMN IF EXISTS "booking_type",
    DROP COLUMN IF EXISTS "refund_amount",
    DROP COLUMN IF EXISTS "refund_date";
  `)
}
