import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instructors" ADD COLUMN IF NOT EXISTS "cover_image_id" integer;
   ALTER TABLE "instructors" ADD CONSTRAINT "instructors_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX IF NOT EXISTS "instructors_cover_image_idx" ON "instructors" USING btree ("cover_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instructors" DROP CONSTRAINT IF EXISTS "instructors_cover_image_id_media_id_fk";
   DROP INDEX IF EXISTS "instructors_cover_image_idx";
   ALTER TABLE "instructors" DROP COLUMN IF EXISTS "cover_image_id";`)
}
