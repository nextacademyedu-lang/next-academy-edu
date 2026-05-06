import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_id" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "users_clerk_id_idx" ON "users" ("clerk_id");
    
    ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "show_on_home" boolean DEFAULT false;

    CREATE TABLE IF NOT EXISTS "learning_paths" (
      "id" serial PRIMARY KEY NOT NULL,
      "title_ar" varchar NOT NULL,
      "title_en" varchar,
      "slug" varchar NOT NULL,
      "description_ar" varchar,
      "description_en" varchar,
      "thumbnail_id" integer REFERENCES "media"("id") ON DELETE set null ON UPDATE no action,
      "cover_image_id" integer REFERENCES "media"("id") ON DELETE set null ON UPDATE no action,
      "price" numeric,
      "currency" varchar DEFAULT 'EGP',
      "is_active" boolean DEFAULT true,
      "is_featured" boolean DEFAULT false,
      "order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "learning_paths_slug_idx" ON "learning_paths" ("slug");

    CREATE TABLE IF NOT EXISTS "learning_paths_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL REFERENCES "learning_paths"("id") ON DELETE cascade ON UPDATE no action,
      "path" varchar NOT NULL,
      "programs_id" integer REFERENCES "programs"("id") ON DELETE cascade ON UPDATE no action
    );
    
    CREATE INDEX IF NOT EXISTS "learning_paths_order_idx" ON "learning_paths" ("order");
    CREATE INDEX IF NOT EXISTS "learning_paths_created_at_idx" ON "learning_paths" ("created_at");
    CREATE INDEX IF NOT EXISTS "learning_paths_rels_order_idx" ON "learning_paths_rels" ("order");
    CREATE INDEX IF NOT EXISTS "learning_paths_rels_parent_idx" ON "learning_paths_rels" ("parent_id");
    CREATE INDEX IF NOT EXISTS "learning_paths_rels_path_idx" ON "learning_paths_rels" ("path");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "learning_paths_rels";
    DROP TABLE IF EXISTS "learning_paths";
    ALTER TABLE "categories" DROP COLUMN IF EXISTS "show_on_home";
    DROP INDEX IF EXISTS "users_clerk_id_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_id";
  `);
}
