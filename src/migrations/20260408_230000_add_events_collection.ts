import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- Enums
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_type') THEN
      CREATE TYPE "public"."enum_events_type" AS ENUM('event', 'retreat', 'corporate_training');
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_location_type') THEN
      CREATE TYPE "public"."enum_events_location_type" AS ENUM('online', 'in_person', 'hybrid');
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_currency') THEN
      CREATE TYPE "public"."enum_events_currency" AS ENUM('EGP', 'USD', 'EUR', 'SAR');
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_language') THEN
      CREATE TYPE "public"."enum_events_language" AS ENUM('ar', 'en', 'both');
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_custom_registration_fields_field_type') THEN
      CREATE TYPE "public"."enum_events_custom_registration_fields_field_type" AS ENUM('text', 'email', 'phone', 'textarea', 'select', 'checkbox');
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_events_speakers_role') THEN
      CREATE TYPE "public"."enum_events_speakers_role" AS ENUM('speaker', 'host', 'panelist', 'moderator');
    END IF;
  END $$;

  -- Main events table
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_events_type" DEFAULT 'event' NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"title_en" varchar,
  	"slug" varchar NOT NULL,
  	"description_ar" jsonb,
  	"description_en" jsonb,
  	"short_description_ar" varchar,
  	"short_description_en" varchar,
  	"category_id" integer,
  	"thumbnail_id" integer,
  	"cover_image_id" integer,
  	"event_date" timestamp(3) with time zone NOT NULL,
  	"event_end_date" timestamp(3) with time zone,
  	"duration_hours" numeric,
  	"registration_deadline" timestamp(3) with time zone,
  	"location_type" "enum_events_location_type" DEFAULT 'in_person',
  	"venue" varchar,
  	"venue_address" varchar,
  	"online_link" varchar,
  	"max_capacity" numeric,
  	"price" numeric DEFAULT 0,
  	"currency" "enum_events_currency" DEFAULT 'EGP',
  	"language" "enum_events_language" DEFAULT 'ar',
  	"is_featured" boolean DEFAULT false,
  	"featured_priority" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"attendees_count" numeric DEFAULT 0,
  	"view_count" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  -- Custom registration fields sub-table
  CREATE TABLE IF NOT EXISTS "events_custom_registration_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field_label" varchar NOT NULL,
  	"field_type" "enum_events_custom_registration_fields_field_type" DEFAULT 'text',
  	"select_options" varchar,
  	"is_required" boolean DEFAULT false
  );

  -- Speakers sub-table
  CREATE TABLE IF NOT EXISTS "events_speakers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"bio" varchar,
  	"photo_id" integer,
  	"role" "enum_events_speakers_role" DEFAULT 'speaker'
  );

  -- Agenda sub-table
  CREATE TABLE IF NOT EXISTS "events_agenda" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"title_en" varchar,
  	"description_ar" varchar,
  	"speaker" varchar
  );

  -- Itinerary sub-table
  CREATE TABLE IF NOT EXISTS "events_itinerary" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_number" numeric NOT NULL,
  	"title_ar" varchar NOT NULL,
  	"title_en" varchar
  );

  -- Itinerary activities sub-table
  CREATE TABLE IF NOT EXISTS "events_itinerary_activities" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"activity_ar" varchar NOT NULL,
  	"activity_en" varchar
  );

  -- Event includes sub-table
  CREATE TABLE IF NOT EXISTS "events_event_includes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );

  -- Event excludes sub-table
  CREATE TABLE IF NOT EXISTS "events_event_excludes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );

  -- Target audience sub-table
  CREATE TABLE IF NOT EXISTS "events_target_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );

  -- SEO keywords sub-table
  CREATE TABLE IF NOT EXISTS "events_seo_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );

  -- Tags relationship table (hasMany)
  CREATE TABLE IF NOT EXISTS "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"partners_id" integer
  );

  -- Unique slug index
  CREATE UNIQUE INDEX IF NOT EXISTS "events_slug_idx" ON "events" USING btree ("slug");

  -- Standard indexes
  CREATE INDEX IF NOT EXISTS "events_category_idx" ON "events" USING btree ("category_id");
  CREATE INDEX IF NOT EXISTS "events_thumbnail_idx" ON "events" USING btree ("thumbnail_id");
  CREATE INDEX IF NOT EXISTS "events_cover_image_idx" ON "events" USING btree ("cover_image_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");

  -- Sub-table indexes
  CREATE INDEX IF NOT EXISTS "events_custom_registration_fields_order_idx" ON "events_custom_registration_fields" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_custom_registration_fields_parent_id_idx" ON "events_custom_registration_fields" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_speakers_order_idx" ON "events_speakers" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_speakers_parent_id_idx" ON "events_speakers" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_speakers_photo_idx" ON "events_speakers" USING btree ("photo_id");
  CREATE INDEX IF NOT EXISTS "events_agenda_order_idx" ON "events_agenda" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_agenda_parent_id_idx" ON "events_agenda" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_itinerary_order_idx" ON "events_itinerary" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_itinerary_parent_id_idx" ON "events_itinerary" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_itinerary_activities_order_idx" ON "events_itinerary_activities" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_itinerary_activities_parent_id_idx" ON "events_itinerary_activities" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_event_includes_order_idx" ON "events_event_includes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_event_includes_parent_id_idx" ON "events_event_includes" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_event_excludes_order_idx" ON "events_event_excludes" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_event_excludes_parent_id_idx" ON "events_event_excludes" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_target_audience_order_idx" ON "events_target_audience" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_target_audience_parent_id_idx" ON "events_target_audience" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "events_seo_keywords_order_idx" ON "events_seo_keywords" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "events_seo_keywords_parent_id_idx" ON "events_seo_keywords" USING btree ("_parent_id");

  -- Rels indexes
  CREATE INDEX IF NOT EXISTS "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "events_rels_tags_id_idx" ON "events_rels" USING btree ("tags_id");
  CREATE INDEX IF NOT EXISTS "events_rels_partners_id_idx" ON "events_rels" USING btree ("partners_id");

  -- Foreign keys
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_category_id_categories_id_fk') THEN
      ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_thumbnail_id_media_id_fk') THEN
      ALTER TABLE "events" ADD CONSTRAINT "events_thumbnail_id_media_id_fk" FOREIGN KEY ("thumbnail_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_cover_image_id_media_id_fk') THEN
      ALTER TABLE "events" ADD CONSTRAINT "events_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_custom_registration_fields_parent_id_fk') THEN
      ALTER TABLE "events_custom_registration_fields" ADD CONSTRAINT "events_custom_registration_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_speakers_photo_id_media_id_fk') THEN
      ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_speakers_parent_id_fk') THEN
      ALTER TABLE "events_speakers" ADD CONSTRAINT "events_speakers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_agenda_parent_id_fk') THEN
      ALTER TABLE "events_agenda" ADD CONSTRAINT "events_agenda_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_itinerary_parent_id_fk') THEN
      ALTER TABLE "events_itinerary" ADD CONSTRAINT "events_itinerary_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_itinerary_activities_parent_id_fk') THEN
      ALTER TABLE "events_itinerary_activities" ADD CONSTRAINT "events_itinerary_activities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events_itinerary"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_event_includes_parent_id_fk') THEN
      ALTER TABLE "events_event_includes" ADD CONSTRAINT "events_event_includes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_event_excludes_parent_id_fk') THEN
      ALTER TABLE "events_event_excludes" ADD CONSTRAINT "events_event_excludes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_target_audience_parent_id_fk') THEN
      ALTER TABLE "events_target_audience" ADD CONSTRAINT "events_target_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_seo_keywords_parent_id_fk') THEN
      ALTER TABLE "events_seo_keywords" ADD CONSTRAINT "events_seo_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_rels_parent_fk') THEN
      ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_rels_tags_fk') THEN
      ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_rels_partners_fk') THEN
      ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  -- Add events to payload_locked_documents_rels
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "events_id" integer;

  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_events_fk') THEN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
    END IF;
  END $$;

  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "events_custom_registration_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_speakers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_agenda" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_itinerary_activities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_itinerary" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_event_includes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_event_excludes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_target_audience" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_seo_keywords" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;

  DROP TABLE IF EXISTS "events_custom_registration_fields" CASCADE;
  DROP TABLE IF EXISTS "events_speakers" CASCADE;
  DROP TABLE IF EXISTS "events_agenda" CASCADE;
  DROP TABLE IF EXISTS "events_itinerary_activities" CASCADE;
  DROP TABLE IF EXISTS "events_itinerary" CASCADE;
  DROP TABLE IF EXISTS "events_event_includes" CASCADE;
  DROP TABLE IF EXISTS "events_event_excludes" CASCADE;
  DROP TABLE IF EXISTS "events_target_audience" CASCADE;
  DROP TABLE IF EXISTS "events_seo_keywords" CASCADE;
  DROP TABLE IF EXISTS "events_rels" CASCADE;
  DROP TABLE IF EXISTS "events" CASCADE;

  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_events_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_events_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "events_id";

  DROP TYPE IF EXISTS "public"."enum_events_type";
  DROP TYPE IF EXISTS "public"."enum_events_location_type";
  DROP TYPE IF EXISTS "public"."enum_events_currency";
  DROP TYPE IF EXISTS "public"."enum_events_language";
  DROP TYPE IF EXISTS "public"."enum_events_custom_registration_fields_field_type";
  DROP TYPE IF EXISTS "public"."enum_events_speakers_role";
  `)
}
