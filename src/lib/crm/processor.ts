import type { CrmProcessorOptions, CrmProcessorResult } from './types.ts';
import { parsePositiveInt } from './utils.ts';
import {
  fetchPendingCrmEvents,
  markCrmEventDone,
  markCrmEventFailure,
  markCrmEventProcessing,
} from './queue.ts';
import { processCrmEventOrThrow } from './service.ts';

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
    }
  }

  summary.success = summary.failed === 0;
  summary.durationMs = Date.now() - startedAt;
  return summary;
}
