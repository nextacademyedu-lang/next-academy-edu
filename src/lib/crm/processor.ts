import type { CrmProcessorOptions, CrmProcessorResult } from './types.ts';
import { parsePositiveInt } from './utils.ts';
import {
  fetchPendingCrmEvents,
  markCrmEventDone,
  markCrmEventFailure,
  markCrmEventProcessing,
} from './queue.ts';
import { processCrmEventOrThrow } from './service.ts';
import { safeErrorMessage } from './utils.ts';
import { sendCrmSyncFailureAlert } from '../email/admin-alerts.ts';

// ─── Failure Tracking (Redis + Memory Fallback) ─────────────────────────────

let redisClient: any = null;
const memoryFailures = new Map<string, number>();

async function getRedis() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      const { default: Redis } = await import('ioredis');
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      });
      redisClient.on('error', () => {
        redisClient = null;
      });
    } catch {
      redisClient = null;
    }
  }
  return redisClient;
}

async function incrementFailureCount(userId: string): Promise<number> {
  const redis = await getRedis();
  if (redis) {
    const key = `crm_fail:${userId}`;
    const val = await (redis as any).incr(key);
    await (redis as any).expire(key, 86400 * 7); // 7 days
    return val;
  }
  const count = (memoryFailures.get(userId) || 0) + 1;
  memoryFailures.set(userId, count);
  return count;
}

async function resetFailureCount(userId: string): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    await (redis as any).del(`crm_fail:${userId}`);
    return;
  }
  memoryFailures.delete(userId);
}

type PayloadLike = {
  find: (args: any) => Promise<{ docs: unknown[] }>;
  update: (args: any) => Promise<unknown>;
  findByID: (args: any) => Promise<any>;
};

export async function processCrmSyncQueue(
  payload: PayloadLike,
  options: CrmProcessorOptions = {},
): Promise<CrmProcessorResult> {
  const startedAt = Date.now();
  const now = options.now ?? new Date();
  const batchSize = options.batchSize ?? parsePositiveInt(process.env.CRM_SYNC_BATCH_SIZE, 25);
  const maxAttempts = options.maxAttempts ?? parsePositiveInt(process.env.CRM_SYNC_MAX_ATTEMPTS, 5);
  const staleLockMinutes =
    options.staleLockMinutes ?? parsePositiveInt(process.env.CRM_SYNC_STALE_LOCK_MINUTES, 30);
  const staleLockBefore = new Date(now.getTime() - staleLockMinutes * 60_000).toISOString();

  const summary: CrmProcessorResult = {
    success: true,
    disabled: false,
    processed: 0,
    succeeded: 0,
    failed: 0,
    deadLettered: 0,
    skipped: 0,
    durationMs: 0,
    errors: [],
  };

  if (!process.env.TWENTY_CRM_URL || !process.env.TWENTY_CRM_API_KEY) {
    summary.disabled = true;
    summary.durationMs = Date.now() - startedAt;
    return summary;
  }

  const events = await fetchPendingCrmEvents(
    payload,
    batchSize,
    now.toISOString(),
    staleLockBefore,
  );
  if (events.length === 0) {
    summary.durationMs = Date.now() - startedAt;
    return summary;
  }

  for (const event of events) {
    summary.processed++;

    try {
      await markCrmEventProcessing(payload, event);
      const result = await processCrmEventOrThrow(payload, event);

      if (result.skipped) {
        summary.skipped++;
      } else {
        summary.succeeded++;
      }

      if (event.entityType === 'user') {
        await resetFailureCount(String(event.entityId));
      }

      await markCrmEventDone(payload, event.id, {
        skipped: result.skipped,
        reason: result.reason,
        data: result.data,
      });
    } catch (error) {
      summary.failed++;
      const failure = await markCrmEventFailure(payload, {
        event: {
          ...event,
          attempts: (event.attempts || 0) + 1,
        },
        maxAttempts,
        error,
      });

      if (failure.deadLettered) {
        summary.deadLettered++;
      }
      summary.errors.push(failure.message);

      // Trigger Alert after 3 consecutive failures for a user
      if (event.entityType === 'user') {
        const userId = String(event.entityId);
        const failureCount = await incrementFailureCount(userId);

        if (failureCount === 3) {
          try {
            const user = await payload.findByID({
              collection: 'users',
              id: userId,
              depth: 0,
              overrideAccess: true,
            });
            if (user && user.email) {
              await sendCrmSyncFailureAlert({
                userId,
                userEmail: user.email,
                failureCount,
                lastError: failure.message,
                timestamp: new Date().toISOString(),
              });
            }
          } catch (alertError) {
            console.error('[crm][alert] failed to send failure alert:', alertError);
          }
        }
      }
    }
  }

  summary.success = summary.failed === 0;
  summary.durationMs = Date.now() - startedAt;
  return summary;
}
