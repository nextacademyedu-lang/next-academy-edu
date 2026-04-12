import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "instructor_program_submissions_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );

    ALTER TABLE IF EXISTS "instructor_program_submissions_rels"
      ADD COLUMN IF NOT EXISTS "order" integer;
    ALTER TABLE IF EXISTS "instructor_program_submissions_rels"
      ADD COLUMN IF NOT EXISTS "parent_id" integer;
    ALTER TABLE IF EXISTS "instructor_program_submissions_rels"
      ADD COLUMN IF NOT EXISTS "path" varchar;
    ALTER TABLE IF EXISTS "instructor_program_submissions_rels"
      ADD COLUMN IF NOT EXISTS "media_id" integer;

    UPDATE "instructor_program_submissions_rels"
      SET "path" = 'attachments'
      WHERE "path" IS NULL OR "path" = '';

    ALTER TABLE IF EXISTS "instructor_program_submissions_rels"
      ALTER COLUMN "parent_id" SET NOT NULL;
    ALTER TABLE IF EXISTS "instructor_program_submissions_rels"
      ALTER COLUMN "path" SET NOT NULL;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'instructor_program_submissions_rels_parent_fk'
      ) THEN
        ALTER TABLE "instructor_program_submissions_rels"
        ADD CONSTRAINT "instructor_program_submissions_rels_parent_fk"
        FOREIGN KEY ("parent_id")
        REFERENCES "public"."instructor_program_submissions"("id")
        ON DELETE cascade
        ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'instructor_program_submissions_rels_media_fk'
      ) THEN
        ALTER TABLE "instructor_program_submissions_rels"
        ADD CONSTRAINT "instructor_program_submissions_rels_media_fk"
        FOREIGN KEY ("media_id")
        REFERENCES "public"."media"("id")
        ON DELETE cascade
        ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "instructor_program_submissions_rels_order_idx"
      ON "instructor_program_submissions_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "instructor_program_submissions_rels_parent_idx"
      ON "instructor_program_submissions_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "instructor_program_submissions_rels_path_idx"
      ON "instructor_program_submissions_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "instructor_program_submissions_rels_media_id_idx"
      ON "instructor_program_submissions_rels" USING btree ("media_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Intentionally no-op: this repair migration should not remove production data.
}
