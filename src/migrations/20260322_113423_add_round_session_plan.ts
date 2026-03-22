import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_rounds_session_plan_location_type" AS ENUM('online', 'in-person', 'hybrid');
  CREATE TABLE "rounds_session_plan" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"start_time" varchar DEFAULT '10:00' NOT NULL,
  	"end_time" varchar DEFAULT '12:00' NOT NULL,
  	"location_type" "enum_rounds_session_plan_location_type",
  	"location_name" varchar,
  	"location_address" varchar,
  	"meeting_url" varchar
  );
  
  ALTER TABLE "rounds_session_plan" ADD CONSTRAINT "rounds_session_plan_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "rounds_session_plan_order_idx" ON "rounds_session_plan" USING btree ("_order");
  CREATE INDEX "rounds_session_plan_parent_id_idx" ON "rounds_session_plan" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "rounds_session_plan" CASCADE;
  DROP TYPE "public"."enum_rounds_session_plan_location_type";`)
}
