import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_instructor_program_submissions_status" AS ENUM('draft', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_instructor_program_submissions_type" AS ENUM('workshop', 'course', 'webinar');
  CREATE TYPE "public"."enum_instructor_program_submissions_language" AS ENUM('ar', 'en', 'both');
  CREATE TYPE "public"."enum_instructor_program_submissions_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_instructor_program_submissions_currency" AS ENUM('EGP', 'USD', 'EUR');
  CREATE TABLE "instructor_program_submissions_session_outline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"session_number" numeric,
  	"title" varchar NOT NULL,
  	"summary" varchar
  );
  
  CREATE TABLE "instructor_program_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instructor_id" integer NOT NULL,
  	"submitted_by_id" integer NOT NULL,
  	"status" "enum_instructor_program_submissions_status" DEFAULT 'draft' NOT NULL,
  	"submitted_at" timestamp(3) with time zone,
  	"reviewed_at" timestamp(3) with time zone,
  	"review_notes" varchar,
  	"type" "enum_instructor_program_submissions_type" NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"title_en" varchar,
  	"short_description_ar" varchar NOT NULL,
  	"short_description_en" varchar,
  	"description_ar" varchar NOT NULL,
  	"description_en" varchar,
  	"category_name" varchar,
  	"duration_hours" numeric,
  	"sessions_count" numeric NOT NULL,
  	"language" "enum_instructor_program_submissions_language" DEFAULT 'ar',
  	"level" "enum_instructor_program_submissions_level",
  	"price" numeric,
  	"currency" "enum_instructor_program_submissions_currency" DEFAULT 'EGP',
  	"objectives_text" varchar,
  	"requirements_text" varchar,
  	"target_audience_text" varchar,
  	"extra_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructor_program_submissions_id" integer;
  ALTER TABLE "instructor_program_submissions_session_outline" ADD CONSTRAINT "instructor_program_submissions_session_outline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructor_program_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructor_program_submissions" ADD CONSTRAINT "instructor_program_submissions_instructor_id_instructors_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructor_program_submissions" ADD CONSTRAINT "instructor_program_submissions_submitted_by_id_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "instructor_program_submissions_session_outline_order_idx" ON "instructor_program_submissions_session_outline" USING btree ("_order");
  CREATE INDEX "instructor_program_submissions_session_outline_parent_id_idx" ON "instructor_program_submissions_session_outline" USING btree ("_parent_id");
  CREATE INDEX "instructor_program_submissions_instructor_idx" ON "instructor_program_submissions" USING btree ("instructor_id");
  CREATE INDEX "instructor_program_submissions_submitted_by_idx" ON "instructor_program_submissions" USING btree ("submitted_by_id");
  CREATE INDEX "instructor_program_submissions_updated_at_idx" ON "instructor_program_submissions" USING btree ("updated_at");
  CREATE INDEX "instructor_program_submissions_created_at_idx" ON "instructor_program_submissions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructor_program_submissi_fk" FOREIGN KEY ("instructor_program_submissions_id") REFERENCES "public"."instructor_program_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_instructor_program_submiss_idx" ON "payload_locked_documents_rels" USING btree ("instructor_program_submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instructor_program_submissions_session_outline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructor_program_submissions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "instructor_program_submissions_session_outline" CASCADE;
  DROP TABLE "instructor_program_submissions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructor_program_submissi_fk";
  
  DROP INDEX "payload_locked_documents_rels_instructor_program_submiss_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructor_program_submissions_id";
  DROP TYPE "public"."enum_instructor_program_submissions_status";
  DROP TYPE "public"."enum_instructor_program_submissions_type";
  DROP TYPE "public"."enum_instructor_program_submissions_language";
  DROP TYPE "public"."enum_instructor_program_submissions_level";
  DROP TYPE "public"."enum_instructor_program_submissions_currency";`)
}
