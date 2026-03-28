import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "instructor_program_submissions"
    DROP CONSTRAINT IF EXISTS "instructor_program_submissions_instructor_id_instructors_id_fk";

    ALTER TABLE "instructor_program_submissions"
    DROP CONSTRAINT IF EXISTS "instructor_program_submissions_submitted_by_id_users_id_fk";

    ALTER TABLE "instructor_program_submissions"
    ADD CONSTRAINT "instructor_program_submissions_instructor_id_instructors_id_fk"
    FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;

    ALTER TABLE "instructor_program_submissions"
    ADD CONSTRAINT "instructor_program_submissions_submitted_by_id_users_id_fk"
    FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "instructor_program_submissions"
    DROP CONSTRAINT IF EXISTS "instructor_program_submissions_instructor_id_instructors_id_fk";

    ALTER TABLE "instructor_program_submissions"
    DROP CONSTRAINT IF EXISTS "instructor_program_submissions_submitted_by_id_users_id_fk";

    ALTER TABLE "instructor_program_submissions"
    ADD CONSTRAINT "instructor_program_submissions_instructor_id_instructors_id_fk"
    FOREIGN KEY ("instructor_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;

    ALTER TABLE "instructor_program_submissions"
    ADD CONSTRAINT "instructor_program_submissions_submitted_by_id_users_id_fk"
    FOREIGN KEY ("submitted_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  `);
}

