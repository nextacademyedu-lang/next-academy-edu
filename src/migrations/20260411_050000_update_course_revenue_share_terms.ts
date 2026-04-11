import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "course_revenue_share" SET DEFAULT 33;
  UPDATE "instructors"
    SET "course_revenue_share" = 33
    WHERE "course_revenue_share" IS NULL OR "course_revenue_share" = 30;

  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "agreement_version" SET DEFAULT 'v1.2';
  UPDATE "instructors"
    SET "agreement_version" = 'v1.2'
    WHERE "agreement_version" IS NULL OR "agreement_version" = '';
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "course_revenue_share" SET DEFAULT 30;

  ALTER TABLE IF EXISTS "instructors"
    ALTER COLUMN "agreement_version" SET DEFAULT 'v1.1';
  `)
}
