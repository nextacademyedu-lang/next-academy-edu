import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "public"."enum_users_signup_intent"
    ADD VALUE IF NOT EXISTS 'b2b_manager';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // PostgreSQL enums do not support removing a single value safely in place.
  // Keep down migration as a no-op to avoid destructive enum recreation.
  await db.execute(sql`SELECT 1;`)
}

