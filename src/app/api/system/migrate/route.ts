import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get('token') !== 'run-migrations-nextacademy-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config });
    const adapter = payload.db as any;

    if (!adapter || !adapter.drizzle) {
      return NextResponse.json({ error: 'Database adapter not found or not Drizzle' }, { status: 500 });
    }

    // Run the migrations manually
    const { sql } = require('@payloadcms/db-postgres');

    // 1. Fix user_profiles work_field enum
    await adapter.drizzle.execute(sql`
      ALTER TABLE "user_profiles" ALTER COLUMN "work_field" TYPE varchar USING "work_field"::varchar;
      DROP TYPE IF EXISTS enum_user_profiles_work_field;
    `);

    // 2. Fix promo_banners_rels in payload_locked_documents_rels
    await adapter.drizzle.execute(sql`
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

    return NextResponse.json({ success: true, message: 'Migrations executed successfully.' });
  } catch (err: any) {
    console.error('Migration error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
