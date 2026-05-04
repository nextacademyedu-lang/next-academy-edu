import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Convert enum_user_profiles_work_field to varchar
  await db.execute(sql`
    ALTER TABLE "user_profiles" ALTER COLUMN "work_field" TYPE varchar USING "work_field"::varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert not strictly necessary for this fix
}
