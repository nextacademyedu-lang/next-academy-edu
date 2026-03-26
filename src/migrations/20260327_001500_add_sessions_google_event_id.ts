import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sessions" ADD COLUMN IF NOT EXISTS "google_event_id" varchar;
   CREATE INDEX IF NOT EXISTS "sessions_google_event_id_idx" ON "sessions" USING btree ("google_event_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "sessions_google_event_id_idx";
   ALTER TABLE "sessions" DROP COLUMN IF EXISTS "google_event_id";`)
}
