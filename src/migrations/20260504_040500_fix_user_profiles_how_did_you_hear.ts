import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Convert enum_user_profiles_how_did_you_hear to varchar
  await db.execute(sql`
    ALTER TABLE "user_profiles" ALTER COLUMN "how_did_you_hear" TYPE varchar USING "how_did_you_hear"::varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Revert not strictly necessary for this fix
}
