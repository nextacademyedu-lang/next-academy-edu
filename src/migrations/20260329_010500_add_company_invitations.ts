import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_company_invitations_status'
      ) THEN
        CREATE TYPE "public"."enum_company_invitations_status" AS ENUM(
          'pending',
          'accepted',
          'revoked',
          'expired'
        );
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS "company_invitations" (
      "id" serial PRIMARY KEY NOT NULL,
      "email" varchar NOT NULL,
      "company_id" integer NOT NULL,
      "invited_by_id" integer NOT NULL,
      "job_title" varchar,
      "title" varchar,
      "token" varchar NOT NULL,
      "status" "enum_company_invitations_status" DEFAULT 'pending' NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "accepted_at" timestamp(3) with time zone,
      "accepted_by_id" integer,
      "revoked_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN IF NOT EXISTS "company_invitations_id" integer;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_invitations_company_id_companies_id_fk'
      ) THEN
        ALTER TABLE "company_invitations"
          ADD CONSTRAINT "company_invitations_company_id_companies_id_fk"
          FOREIGN KEY ("company_id")
          REFERENCES "public"."companies"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_invitations_invited_by_id_users_id_fk'
      ) THEN
        ALTER TABLE "company_invitations"
          ADD CONSTRAINT "company_invitations_invited_by_id_users_id_fk"
          FOREIGN KEY ("invited_by_id")
          REFERENCES "public"."users"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'company_invitations_accepted_by_id_users_id_fk'
      ) THEN
        ALTER TABLE "company_invitations"
          ADD CONSTRAINT "company_invitations_accepted_by_id_users_id_fk"
          FOREIGN KEY ("accepted_by_id")
          REFERENCES "public"."users"("id")
          ON DELETE set null
          ON UPDATE no action;
      END IF;
    END $$;

    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_company_invitations_fk'
      ) THEN
        ALTER TABLE "payload_locked_documents_rels"
          ADD CONSTRAINT "payload_locked_documents_rels_company_invitations_fk"
          FOREIGN KEY ("company_invitations_id")
          REFERENCES "public"."company_invitations"("id")
          ON DELETE cascade
          ON UPDATE no action;
      END IF;
    END $$;

    CREATE UNIQUE INDEX IF NOT EXISTS "company_invitations_token_idx"
      ON "company_invitations" USING btree ("token");
    CREATE INDEX IF NOT EXISTS "company_invitations_email_idx"
      ON "company_invitations" USING btree ("email");
    CREATE INDEX IF NOT EXISTS "company_invitations_company_idx"
      ON "company_invitations" USING btree ("company_id");
    CREATE INDEX IF NOT EXISTS "company_invitations_invited_by_idx"
      ON "company_invitations" USING btree ("invited_by_id");
    CREATE INDEX IF NOT EXISTS "company_invitations_accepted_by_idx"
      ON "company_invitations" USING btree ("accepted_by_id");
    CREATE INDEX IF NOT EXISTS "company_invitations_updated_at_idx"
      ON "company_invitations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "company_invitations_created_at_idx"
      ON "company_invitations" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_company_invitations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("company_invitations_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "company_invitations" DISABLE ROW LEVEL SECURITY;
    DROP TABLE "company_invitations" CASCADE;

    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_company_invitations_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_company_invitations_id_idx";
    ALTER TABLE "payload_locked_documents_rels"
      DROP COLUMN IF EXISTS "company_invitations_id";

    DROP TYPE IF EXISTS "public"."enum_company_invitations_status";
  `)
}
