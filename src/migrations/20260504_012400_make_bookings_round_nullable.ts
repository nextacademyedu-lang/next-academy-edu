import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Make round_id nullable so event-only bookings can be created
  await db.execute(sql`
    ALTER TABLE "bookings" ALTER COLUMN "round_id" DROP NOT NULL;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore NOT NULL (only safe if no null values exist)
  await db.execute(sql`
    ALTER TABLE "bookings" ALTER COLUMN "round_id" SET NOT NULL;
  `);
}
