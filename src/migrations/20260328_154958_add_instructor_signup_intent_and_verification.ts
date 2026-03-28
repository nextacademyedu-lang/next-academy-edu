import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_signup_intent" AS ENUM('student', 'instructor');
  CREATE TYPE "public"."enum_instructors_verification_status" AS ENUM('draft', 'pending', 'approved', 'rejected');
  ALTER TABLE "users" ADD COLUMN "signup_intent" "enum_users_signup_intent" DEFAULT 'student' NOT NULL;
  ALTER TABLE "instructors" ADD COLUMN "verification_status" "enum_instructors_verification_status" DEFAULT 'approved';
  ALTER TABLE "instructors" ADD COLUMN "submitted_at" timestamp(3) with time zone;
  ALTER TABLE "instructors" ADD COLUMN "approved_at" timestamp(3) with time zone;
  ALTER TABLE "instructors" ADD COLUMN "rejected_at" timestamp(3) with time zone;
  ALTER TABLE "instructors" ADD COLUMN "rejection_reason" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "signup_intent";
  ALTER TABLE "instructors" DROP COLUMN "verification_status";
  ALTER TABLE "instructors" DROP COLUMN "submitted_at";
  ALTER TABLE "instructors" DROP COLUMN "approved_at";
  ALTER TABLE "instructors" DROP COLUMN "rejected_at";
  ALTER TABLE "instructors" DROP COLUMN "rejection_reason";
  DROP TYPE "public"."enum_users_signup_intent";
  DROP TYPE "public"."enum_instructors_verification_status";`)
}
