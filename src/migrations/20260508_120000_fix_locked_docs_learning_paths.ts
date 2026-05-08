import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

/**
 * Fix: Add the missing `learning_paths_id` column to `payload_locked_documents_rels`.
 *
 * When the `learning-paths` collection was added in migration 20260506_230000,
 * the `payload_locked_documents_rels` table was not updated with the
 * corresponding FK column. Payload CMS uses this table to track document
 * locking across all collections — every collection needs a column here.
 *
 * This caused:
 *   - Admin dashboard errors on every page (locked-doc queries fail)
 *   - CRM sync cron job failures (same query path)
 *   - "column ... learning_paths_id does not exist" errors in logs
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "learning_paths_id" integer
        REFERENCES "learning_paths"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_learning_paths_id_idx"
      ON "payload_locked_documents_rels" ("learning_paths_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "payload_locked_documents_rels_learning_paths_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "learning_paths_id";
  `);
}
