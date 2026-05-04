import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // Drop the current buttons table that has the wrong ID type
  await db.execute(sql`
    DROP TABLE IF EXISTS "promo_banners_buttons";
  `);

  // Recreate it using the correct schema that Payload expects for Array fields (varchar ID)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "promo_banners_buttons" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "promo_banners"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY NOT NULL,
      "label_ar" varchar DEFAULT 'اعرف المزيد',
      "label_en" varchar DEFAULT 'Learn More',
      "link" varchar NOT NULL,
      "variant" varchar DEFAULT 'solid',
      "color" varchar DEFAULT '#dc2626',
      "open_in_new_tab" boolean DEFAULT false
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "promo_banners_buttons_parent_idx" ON "promo_banners_buttons" ("_parent_id");
  `);
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  // Fallback to the wrong schema just in case
  await db.execute(sql`
    DROP TABLE IF EXISTS "promo_banners_buttons";
  `);

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
}
