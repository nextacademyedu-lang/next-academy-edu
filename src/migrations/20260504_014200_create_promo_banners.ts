import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Create the promo_banners table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "promo_banners" (
      "id" serial PRIMARY KEY,
      "name" varchar NOT NULL,
      "is_active" boolean DEFAULT true,
      "page" varchar DEFAULT 'home',
      "position" varchar DEFAULT 'after_events',
      "group" varchar DEFAULT 'default',
      "sort_order" numeric DEFAULT 0,

      "title_ar" varchar DEFAULT 'عنوان البانر',
      "title_en" varchar DEFAULT 'Banner Title',
      "subtitle_ar" varchar,
      "subtitle_en" varchar,
      "image_id" integer,

      "layout" varchar DEFAULT 'image_right',
      "height" varchar DEFAULT 'auto',
      "background_color" varchar DEFAULT '#1a2e4a',
      "background_gradient" varchar,
      "text_color" varchar DEFAULT '#ffffff',
      "text_align" varchar DEFAULT 'start',
      "content_align" varchar DEFAULT 'center',
      "overlay_opacity" numeric DEFAULT 60,
      "border_radius" numeric DEFAULT 24,
      "auto_play_speed" numeric DEFAULT 5000,
      "transition" varchar DEFAULT 'fade',

      "updated_at" timestamptz DEFAULT now() NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL
    );
  `);

  // Create the buttons sub-table (array field)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "promo_banners_buttons" (
      "id" serial PRIMARY KEY,
      "_parent_id" integer NOT NULL REFERENCES "promo_banners"("id") ON DELETE CASCADE,
      "_order" integer NOT NULL,
      "label_ar" varchar DEFAULT 'اعرف المزيد',
      "label_en" varchar DEFAULT 'Learn More',
      "link" varchar NOT NULL,
      "variant" varchar DEFAULT 'solid',
      "color" varchar DEFAULT '#dc2626',
      "open_in_new_tab" boolean DEFAULT false
    );
  `);

  // Create index for faster lookups
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "promo_banners_page_position_idx" ON "promo_banners" ("page", "position");
    CREATE INDEX IF NOT EXISTS "promo_banners_buttons_parent_idx" ON "promo_banners_buttons" ("_parent_id");
  `);


}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "promo_banners_buttons";
    DROP TABLE IF EXISTS "promo_banners";
  `);
}
