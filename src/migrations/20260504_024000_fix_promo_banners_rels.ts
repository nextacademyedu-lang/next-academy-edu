import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add missing relations for payload_locked_documents to support drafts/locking
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "promo_banners_id" integer;
    
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_promo_banners_fk') THEN
            ALTER TABLE "payload_locked_documents_rels" 
            ADD CONSTRAINT "payload_locked_documents_rels_promo_banners_fk" 
            FOREIGN KEY ("promo_banners_id") REFERENCES "public"."promo_banners"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
    END $$;

    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_promo_banners_id_idx" 
    ON "payload_locked_documents_rels" USING btree ("promo_banners_id");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_promo_banners_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_promo_banners_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "promo_banners_id";
  `);
}
