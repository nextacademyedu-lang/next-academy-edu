import fs from 'node:fs';
import path from 'node:path';
import { getPayload } from 'payload';
import type { CollectionSlug } from 'payload';
import config from '../src/payload.config.ts';
import { createCrmDedupeKey } from '../src/lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../src/lib/crm/queue.ts';
import type { CrmEntityType } from '../src/lib/crm/types.ts';
import { parsePositiveInt } from '../src/lib/crm/utils.ts';

type BackfillTarget = {
  collection: CollectionSlug;
  entityType: CrmEntityType;
  action: string;
  priority: number;
  shouldSkip?: (doc: Record<string, unknown>) => boolean;
};

type CursorState = Record<string, number>;

const TARGETS: BackfillTarget[] = [
  {
    collection: 'users',
    entityType: 'user',
    action: 'user_backfill',
    priority: 10,
    shouldSkip: (doc) => doc.role === 'admin',
  },
  {
    collection: 'user-profiles',
    entityType: 'user_profile',
    action: 'user_profile_backfill',
    priority: 15,
  },
  {
    collection: 'companies',
    entityType: 'company',
    action: 'company_backfill',
    priority: 10,
  },
  {
    collection: 'leads',
    entityType: 'lead',
    action: 'lead_backfill',
    priority: 15,
  },
  {
    collection: 'bookings',
    entityType: 'booking',
    action: 'booking_backfill',
    priority: 30,
  },
  {
    collection: 'payments',
    entityType: 'payment',
    action: 'payment_backfill',
    priority: 35,
  },
  {
    collection: 'consultation-bookings',
    entityType: 'consultation_booking',
    action: 'consultation_booking_backfill',
    priority: 32,
  },
  {
    collection: 'bulk-seat-allocations',
    entityType: 'bulk_seat_allocation',
    action: 'bulk_seat_backfill',
    priority: 28,
  },
  {
    collection: 'waitlist',
    entityType: 'waitlist',
    action: 'waitlist_backfill',
    priority: 40,
  },
];

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return undefined;
  return process.argv[index + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function loadCursorState(filePath: string): CursorState {
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as CursorState;
  } catch {
    return {};
  }
}

function saveCursorState(filePath: string, state: CursorState): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
}

async function run() {
  const dryRun = hasFlag('--dry-run');
  const pageSize = parsePositiveInt(getArgValue('--page-size'), 200);
  const cursorFile =
    getArgValue('--cursor-file') ||
    path.resolve(process.cwd(), '.tmp/crm-backfill-cursor.json');
  const resetCursor = hasFlag('--reset-cursor');

  if (resetCursor && fs.existsSync(cursorFile)) {
    fs.rmSync(cursorFile, { force: true });
  }

  const cursorState: CursorState = loadCursorState(cursorFile);
  const payload = await getPayload({ config });
  const summary: Record<string, { scanned: number; queued: number; skipped: number }> = {};

  for (const target of TARGETS) {
    let page = cursorState[target.collection] || 1;
    let hasMore = true;

    summary[target.collection] = { scanned: 0, queued: 0, skipped: 0 };
    console.log(
      `[crm-backfill] ${target.collection}: starting from page ${page} (dryRun=${dryRun})`,
    );

    while (hasMore) {
      const result = await payload.find({
        collection: target.collection,
        page,
        limit: pageSize,
        depth: 0,
        sort: 'createdAt',
        overrideAccess: true,
      });

      const docs = result.docs as unknown as Array<Record<string, unknown>>;
      if (docs.length === 0) {
        hasMore = false;
        break;
      }

      for (const doc of docs) {
        summary[target.collection].scanned++;

        if (target.shouldSkip?.(doc)) {
          summary[target.collection].skipped++;
          continue;
        }

        const id = doc.id;
        if (id === undefined || id === null) {
          summary[target.collection].skipped++;
          continue;
        }

        const entityId = String(id);
        const fingerprint = `${doc.updatedAt || doc.createdAt || ''}|backfill`;
        const dedupeKey = createCrmDedupeKey({
          entityType: target.entityType,
          entityId,
          action: target.action,
          fingerprint,
        });

        if (dryRun) {
          summary[target.collection].queued++;
          continue;
        }

        const res = await enqueueCrmSyncEvent({
          payload,
          entityType: target.entityType,
          entityId,
          action: target.action,
          dedupeKey,
          priority: target.priority,
          sourceCollection: target.collection,
          payloadSnapshot: {
            id,
            source: 'backfill',
            updatedAt: doc.updatedAt,
            createdAt: doc.createdAt,
          },
        });

        if (res.created) summary[target.collection].queued++;
        else summary[target.collection].skipped++;
      }

      if (!dryRun) {
        cursorState[target.collection] = page + 1;
        saveCursorState(cursorFile, cursorState);
      }

      hasMore = Boolean((result as { hasNextPage?: boolean }).hasNextPage);
      page += 1;
    }

    if (!dryRun) {
      delete cursorState[target.collection];
      saveCursorState(cursorFile, cursorState);
    }
  }

  console.log('\n[crm-backfill] Summary');
  console.table(summary);
  console.log(`[crm-backfill] Cursor file: ${cursorFile}`);
}

run().catch((error) => {
  const msg = error instanceof Error ? error.message : String(error);
  console.error('[crm-backfill] failed:', msg);
  process.exit(1);
});
