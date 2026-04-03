import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- Create enum for group member roles
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_company_group_members_role'
      ) THEN
        CREATE TYPE "public"."enum_company_group_members_role" AS ENUM('member', 'admin');
      END IF;
    END $$;

    -- Add pending_approval to bookings status enum (safe: IF NOT EXISTS pattern)
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_bookings_status'
        AND pg_enum.enumlabel = 'pending_approval'
      ) THEN
        ALTER TYPE "public"."enum_bookings_status" ADD VALUE 'pending_approval' BEFORE 'confirmed';
      END IF;
    END $$;

    -- Add B2B notification types
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_member_booked'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_member_booked';
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_member_cancelled'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_member_cancelled';
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_invitation_accepted'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_invitation_accepted';
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_seats_low'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_seats_low';
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_budget_threshold'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_budget_threshold';
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_member_joined'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_member_joined';
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'enum_notifications_type'
        AND pg_enum.enumlabel = 'b2b_member_removed'
      ) THEN
        ALTER TYPE "public"."enum_notifications_type" ADD VALUE 'b2b_member_removed';
      END IF;
    END $$;

    -- Create company_groups table
    CREATE TABLE IF NOT EXISTS "company_groups" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "company_id" integer NOT NULL,
      "description" varchar,
      "seat_allocation" numeric,
      "created_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Create company_group_members table
    CREATE TABLE IF NOT EXISTS "company_group_members" (
      "id" serial PRIMARY KEY NOT NULL,
      "user_id" integer NOT NULL,
      "group_id" integer NOT NULL,
      "role" "enum_company_group_members_role" DEFAULT 'member' NOT NULL,
      "added_by_id" integer,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Create company_policies table
    CREATE TABLE IF NOT EXISTS "company_policies" (
      "id" serial PRIMARY KEY NOT NULL,
      "company_id" integer NOT NULL,
      "monthly_budget" numeric,
      "require_approval" boolean DEFAULT false,
      "max_bookings_per_member" numeric,
      "notes" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    -- Create company_policies_rels for many-to-many (allowed/blocked programs)
    CREATE TABLE IF NOT EXISTS "company_policies_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "programs_id" integer
    );

    -- Add totalSeats column to companies
    ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "total_seats" numeric;

    -- Add locked document columns
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_groups_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_group_members_id" integer;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "company_policies_id" integer;

    -- Foreign keys for company_groups
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_groups_company_id_companies_id_fk'
      ) THEN
        ALTER TABLE "company_groups"
          ADD CONSTRAINT "company_groups_company_id_companies_id_fk"
          FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_groups_created_by_id_users_id_fk'
      ) THEN
        ALTER TABLE "company_groups"
          ADD CONSTRAINT "company_groups_created_by_id_users_id_fk"
          FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    -- Foreign keys for company_group_members
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_group_members_user_id_users_id_fk'
      ) THEN
        ALTER TABLE "company_group_members"
          ADD CONSTRAINT "company_group_members_user_id_users_id_fk"
          FOREIGN KEY ("user_id") REFERENCES "public"."users"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_group_members_group_id_company_groups_id_fk'
      ) THEN
        ALTER TABLE "company_group_members"
          ADD CONSTRAINT "company_group_members_group_id_company_groups_id_fk"
          FOREIGN KEY ("group_id") REFERENCES "public"."company_groups"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_group_members_added_by_id_users_id_fk'
      ) THEN
        ALTER TABLE "company_group_members"
          ADD CONSTRAINT "company_group_members_added_by_id_users_id_fk"
          FOREIGN KEY ("added_by_id") REFERENCES "public"."users"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    -- Foreign keys for company_policies
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_policies_company_id_companies_id_fk'
      ) THEN
        ALTER TABLE "company_policies"
          ADD CONSTRAINT "company_policies_company_id_companies_id_fk"
          FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id")
          ON DELETE set null ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_policies_rels_parent_fk'
      ) THEN
        ALTER TABLE "company_policies_rels"
          ADD CONSTRAINT "company_policies_rels_parent_fk"
          FOREIGN KEY ("parent_id") REFERENCES "public"."company_policies"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_policies_rels_programs_fk'
      ) THEN
        ALTER TABLE "company_policies_rels"
          ADD CONSTRAINT "company_policies_rels_programs_fk"
          FOREIGN KEY ("programs_id") REFERENCES "public"."programs"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    -- Indexes
    CREATE INDEX IF NOT EXISTS "company_groups_company_idx" ON "company_groups" USING btree ("company_id");
    CREATE INDEX IF NOT EXISTS "company_groups_created_by_idx" ON "company_groups" USING btree ("created_by_id");
    CREATE INDEX IF NOT EXISTS "company_groups_updated_at_idx" ON "company_groups" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "company_groups_created_at_idx" ON "company_groups" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "company_group_members_user_idx" ON "company_group_members" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "company_group_members_group_idx" ON "company_group_members" USING btree ("group_id");
    CREATE INDEX IF NOT EXISTS "company_group_members_added_by_idx" ON "company_group_members" USING btree ("added_by_id");
    CREATE INDEX IF NOT EXISTS "company_group_members_updated_at_idx" ON "company_group_members" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "company_group_members_created_at_idx" ON "company_group_members" USING btree ("created_at");

    CREATE UNIQUE INDEX IF NOT EXISTS "company_policies_company_idx" ON "company_policies" USING btree ("company_id");
    CREATE INDEX IF NOT EXISTS "company_policies_updated_at_idx" ON "company_policies" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "company_policies_created_at_idx" ON "company_policies" USING btree ("created_at");

    CREATE INDEX IF NOT EXISTS "company_policies_rels_order_idx" ON "company_policies_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "company_policies_rels_parent_idx" ON "company_policies_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "company_policies_rels_path_idx" ON "company_policies_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "company_policies_rels_programs_id_idx" ON "company_policies_rels" USING btree ("programs_id");

    -- Locked documents relations
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_company_groups_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_company_groups_fk"
          FOREIGN KEY ("company_groups_id") REFERENCES "public"."company_groups"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_company_group_members_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_company_group_members_fk"
          FOREIGN KEY ("company_group_members_id") REFERENCES "public"."company_group_members"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_company_policies_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_company_policies_fk"
          FOREIGN KEY ("company_policies_id") REFERENCES "public"."company_policies"("id")
          ON DELETE cascade ON UPDATE no action;
      END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_company_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("company_groups_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_company_group_members_id_idx" ON "payload_locked_documents_rels" USING btree ("company_group_members_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_company_policies_id_idx" ON "payload_locked_documents_rels" USING btree ("company_policies_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Drop locked document constraints
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_company_groups_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_company_group_members_fk";
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_company_policies_fk";

    -- Drop tables
    DROP TABLE IF EXISTS "company_policies_rels" CASCADE;
    DROP TABLE IF EXISTS "company_policies" CASCADE;
    DROP TABLE IF EXISTS "company_group_members" CASCADE;
    DROP TABLE IF EXISTS "company_groups" CASCADE;

    -- Drop locked document columns
    DROP INDEX IF EXISTS "payload_locked_documents_rels_company_groups_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_company_group_members_id_idx";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_company_policies_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "company_groups_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "company_group_members_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "company_policies_id";

    -- Drop companies.total_seats
    ALTER TABLE "companies" DROP COLUMN IF EXISTS "total_seats";

    -- Drop enum
    DROP TYPE IF EXISTS "public"."enum_company_group_members_role";

    -- Note: Cannot safely remove enum values from bookings_status or notifications_type
    -- They are left in place as they are harmless unused values
  `)
}
