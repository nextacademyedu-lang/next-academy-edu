import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getPayload } from 'payload';
import config from '@payload-config';
import { processCrmSyncQueue } from '@/lib/crm/processor';
import { parsePositiveInt } from '@/lib/crm/utils';

export const dynamic = 'force-dynamic';

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function GET(req: NextRequest) {
  const configuredSecret = process.env.CRON_SECRET?.trim();
  if (!configuredSecret) {
    return NextResponse.json(
      { error: 'Cron secret is not configured' },
      { status: 503 },
    );
  }

  const incomingAuth = req.headers.get('authorization') || '';
  const expectedAuth = `Bearer ${configuredSecret}`;
  if (!timingSafeEqualString(incomingAuth, expectedAuth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });
    const batchSize = parsePositiveInt(process.env.CRM_SYNC_BATCH_SIZE, 25);
    const maxAttempts = parsePositiveInt(process.env.CRM_SYNC_MAX_ATTEMPTS, 5);

    const result = await processCrmSyncQueue(payload, { batchSize, maxAttempts });
    const statusCode = result.success ? 200 : 207;

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: statusCode },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[cron/crm-sync] failed:', message);
    return NextResponse.json(
      {
        success: false,
        error: 'CRM sync processor failed',
        details: message,
      },
      { status: 500 },
    );
  }
}
