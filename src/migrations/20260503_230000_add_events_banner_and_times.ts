import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_upcoming_events_config_manual_items_type" AS ENUM('program', 'event');

  CREATE TABLE "promotional_banner" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"is_active" boolean DEFAULT false,
  	"title_ar" varchar DEFAULT 'عنوان البانر' NOT NULL,
  	"title_en" varchar DEFAULT 'Banner Title',
  	"subtitle_ar" varchar,
  	"subtitle_en" varchar,
  	"image_id" integer,
  	"button_text_ar" varchar DEFAULT 'اعرف المزيد',
  	"button_text_en" varchar DEFAULT 'Learn More',
  	"button_link" varchar,
  	"background_color" varchar DEFAULT '#1a2e4a',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "start_time" varchar;
  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "end_time" varchar;
  ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "google_maps_url" varchar;

  ALTER TABLE "upcoming_events_config_manual_items" ADD COLUMN IF NOT EXISTS "type" "enum_upcoming_events_config_manual_items_type" DEFAULT 'program';
  ALTER TABLE "upcoming_events_config_manual_items" ADD COLUMN IF NOT EXISTS "event_id" integer;

  ALTER TABLE "promotional_banner" ADD CONSTRAINT "promotional_banner_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX IF NOT EXISTS "promotional_banner_image_idx" ON "promotional_banner" USING btree ("image_id");

  ALTER TABLE "upcoming_events_config_manual_items" ADD CONSTRAINT "upcoming_events_config_manual_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX IF NOT EXISTS "upcoming_events_config_manual_items_event_idx" ON "upcoming_events_config_manual_items" USING btree ("event_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "promotional_banner" DISABLE ROW LEVEL SECURITY;
  DROP TABLE IF EXISTS "promotional_banner" CASCADE;

  ALTER TABLE "upcoming_events_config_manual_items" DROP CONSTRAINT IF EXISTS "upcoming_events_config_manual_items_event_id_events_id_fk";
  DROP INDEX IF EXISTS "upcoming_events_config_manual_items_event_idx";

  ALTER TABLE "events" DROP COLUMN IF EXISTS "start_time";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "end_time";
  ALTER TABLE "events" DROP COLUMN IF EXISTS "google_maps_url";

  ALTER TABLE "upcoming_events_config_manual_items" DROP COLUMN IF EXISTS "type";
  ALTER TABLE "upcoming_events_config_manual_items" DROP COLUMN IF EXISTS "event_id";

  DROP TYPE IF EXISTS "public"."enum_upcoming_events_config_manual_items_type";
  `)
}
