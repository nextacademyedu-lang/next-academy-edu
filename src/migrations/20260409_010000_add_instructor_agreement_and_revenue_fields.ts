import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "agreement_accepted" boolean DEFAULT false;
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "agreement_accepted_at" timestamp(3) with time zone;
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "agreement_version" varchar DEFAULT 'v1.0';
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "course_revenue_share" numeric DEFAULT 33;
  ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "consultation_revenue_share" numeric DEFAULT 50;
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "agreement_accepted";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "agreement_accepted_at";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "agreement_version";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "course_revenue_share";
  ALTER TABLE "instructors" DROP COLUMN IF EXISTS "consultation_revenue_share";
  `)
}
