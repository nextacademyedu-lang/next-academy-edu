import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ADD COLUMN IF NOT EXISTS "rounds_count" numeric DEFAULT 1;

  UPDATE "instructor_program_submissions"
    SET "rounds_count" = 1
    WHERE "rounds_count" IS NULL;

  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ALTER COLUMN "rounds_count" SET DEFAULT 1;

  ALTER TABLE IF EXISTS "instructor_program_submissions"
    ALTER COLUMN "rounds_count" SET NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE IF EXISTS "instructor_program_submissions"
    DROP COLUMN IF EXISTS "rounds_count";
  `)
}
