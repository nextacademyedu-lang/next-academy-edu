import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Repair missing columns introduced by later collection updates.
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;
  ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "event_id" integer;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bookings_event_id_events_id_fk') THEN
      ALTER TABLE "bookings"
      ADD CONSTRAINT "bookings_event_id_events_id_fk"
      FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "bookings_event_idx" ON "bookings" USING btree ("event_id");

  -- Ensure instructor_agreements exists before linking lock-rel rows.
  CREATE TABLE IF NOT EXISTS "instructor_agreements" (
    "id" serial PRIMARY KEY NOT NULL,
    "instructor_id" integer NOT NULL,
    "version" varchar NOT NULL,
    "accepted_at" timestamp(3) with time zone NOT NULL,
    "clauses_accepted" jsonb,
    "terms_snapshot" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'instructor_agreements_instructor_id_instructors_id_fk') THEN
      ALTER TABLE "instructor_agreements"
      ADD CONSTRAINT "instructor_agreements_instructor_id_instructors_id_fk"
      FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "instructor_agreements_instructor_idx" ON "instructor_agreements" USING btree ("instructor_id");
  CREATE INDEX IF NOT EXISTS "instructor_agreements_updated_at_idx" ON "instructor_agreements" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "instructor_agreements_created_at_idx" ON "instructor_agreements" USING btree ("created_at");

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "instructor_agreements_id" integer;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_instructor_agreements_fk') THEN
      ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_instructor_agreements_fk"
      FOREIGN KEY ("instructor_agreements_id") REFERENCES "public"."instructor_agreements"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_instructor_agreements_id_idx"
  ON "payload_locked_documents_rels" USING btree ("instructor_agreements_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Intentionally no-op: repair migration for schema drift.
}
