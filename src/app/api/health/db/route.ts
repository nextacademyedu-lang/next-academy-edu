/**
 * Database Health Check — verifies all Payload collections have matching tables
 * GET /api/health/db
 * Protected by CRON_SECRET
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });

    const collectionSlugs = Object.keys(payload.collections);
    const results: Record<string, { status: string; count?: number; error?: string }> = {};

    for (const slug of collectionSlugs) {
      try {
        const result = await payload.find({
          collection: slug as any,
          limit: 0,       // just get count, no docs
          overrideAccess: true,
        });
        results[slug] = { status: 'ok', count: result.totalDocs };
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        results[slug] = { status: 'error', error: msg.slice(0, 200) };
      }
    }

    // Check migration status via raw pool query (avoids drizzle-orm import)
    let migrationStatus: unknown = null;
    try {
      const db = payload.db as any;
      const pool = db.pool;
      if (pool) {
        const migrationResult = await pool.query(
          'SELECT name, batch, created_at FROM payload_migrations ORDER BY created_at DESC LIMIT 20'
        );
        migrationStatus = migrationResult.rows;
      }
    } catch {
      migrationStatus = 'Could not query migration table';
    }

    // Check if all tables exist via raw pool query
    let allTables: string[] = [];
    try {
      const db = payload.db as any;
      const pool = db.pool;
      if (pool) {
        const tableResult = await pool.query(
          "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
        );
        allTables = (tableResult.rows || []).map((r: any) => r.tablename);
      }
    } catch {
      // ignore
    }

    const failedCollections = Object.entries(results)
      .filter(([, v]) => v.status === 'error')
      .map(([k]) => k);

    return NextResponse.json({
      healthy: failedCollections.length === 0,
      totalCollections: collectionSlugs.length,
      failedCollections,
      collections: results,
      migrations: migrationStatus,
      allTables,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
