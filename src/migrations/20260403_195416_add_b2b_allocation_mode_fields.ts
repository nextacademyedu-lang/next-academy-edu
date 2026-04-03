import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bulk_seat_allocations_allocations_source" AS ENUM('assigned', 'pool_claim');
  CREATE TYPE "public"."enum_bulk_seat_allocations_allocation_mode" AS ENUM('assigned', 'open_pool', 'mixed');
  ALTER TABLE "bulk_seat_allocations_allocations" ADD COLUMN "source" "enum_bulk_seat_allocations_allocations_source" DEFAULT 'assigned';
  ALTER TABLE "bulk_seat_allocations" ADD COLUMN "open_pool_seats" numeric DEFAULT 0;
  ALTER TABLE "bulk_seat_allocations" ADD COLUMN "allocation_mode" "enum_bulk_seat_allocations_allocation_mode" DEFAULT 'mixed' NOT NULL;
  ALTER TABLE "bulk_seat_allocations" ADD COLUMN "created_by_manager_id" integer;
  ALTER TABLE "bulk_seat_allocations" ADD CONSTRAINT "bulk_seat_allocations_created_by_manager_id_users_id_fk" FOREIGN KEY ("created_by_manager_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "bulk_seat_allocations_created_by_manager_idx" ON "bulk_seat_allocations" USING btree ("created_by_manager_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bulk_seat_allocations" DROP CONSTRAINT "bulk_seat_allocations_created_by_manager_id_users_id_fk";
  
  DROP INDEX "bulk_seat_allocations_created_by_manager_idx";
  ALTER TABLE "bulk_seat_allocations_allocations" DROP COLUMN "source";
  ALTER TABLE "bulk_seat_allocations" DROP COLUMN "open_pool_seats";
  ALTER TABLE "bulk_seat_allocations" DROP COLUMN "allocation_mode";
  ALTER TABLE "bulk_seat_allocations" DROP COLUMN "created_by_manager_id";
  DROP TYPE "public"."enum_bulk_seat_allocations_allocations_source";
  DROP TYPE "public"."enum_bulk_seat_allocations_allocation_mode";`)
}
