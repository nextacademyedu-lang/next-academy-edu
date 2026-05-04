import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add color fields to tags
  await db.execute(sql`
    ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "color" varchar DEFAULT '#3b82f6';
    ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "text_color" varchar DEFAULT '#ffffff';
  `);

  // Add extra brand color fields
  await db.execute(sql`
    ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "secondary_color" varchar;
    ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "accent_color" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tags" DROP COLUMN IF EXISTS "color";
    ALTER TABLE "tags" DROP COLUMN IF EXISTS "text_color";
    ALTER TABLE "brands" DROP COLUMN IF EXISTS "secondary_color";
    ALTER TABLE "brands" DROP COLUMN IF EXISTS "accent_color";
  `);
}
