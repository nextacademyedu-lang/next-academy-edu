import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Add missing instructor columns
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "agreement_accepted" boolean DEFAULT false;
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "agreement_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "agreement_version" varchar DEFAULT 'v1.0';
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "course_revenue_share" numeric DEFAULT 33;
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "consultation_revenue_share" numeric DEFAULT 50;

  -- Create instructor_agreements table
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

  -- Foreign keys for instructor_agreements
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'instructor_agreements_instructor_id_instructors_id_fk') THEN
      ALTER TABLE "instructor_agreements" ADD CONSTRAINT "instructor_agreements_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  -- Indexes for instructor_agreements
  CREATE INDEX IF NOT EXISTS "instructor_agreements_instructor_idx" ON "instructor_agreements" USING btree ("instructor_id");
  CREATE INDEX IF NOT EXISTS "instructor_agreements_updated_at_idx" ON "instructor_agreements" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "instructor_agreements_created_at_idx" ON "instructor_agreements" USING btree ("created_at");

  -- Add to payload_locked_documents_rels
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "instructor_agreements_id" integer;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_instructor_agreements_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructor_agreements_fk" FOREIGN KEY ("instructor_agreements_id") REFERENCES "public"."instructor_agreements"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_instructor_agreements_id_idx" ON "payload_locked_documents_rels" USING btree ("instructor_agreements_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "agreement_accepted";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "agreement_accepted_at";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "agreement_version";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "course_revenue_share";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "consultation_revenue_share";

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_instructor_agreements_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_instructor_agreements_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "instructor_agreements_id";

  DROP TABLE IF EXISTS "instructor_agreements" CASCADE;
  `)
}
