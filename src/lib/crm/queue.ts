import type { CrmEventStatus, CrmSyncEventDoc, EnqueueCrmSyncEventInput } from './types.ts';
import { computeRetryDelayMinutes, safeErrorMessage } from './utils.ts';

export const CRM_SYNC_COLLECTION = 'crm-sync-events';

export function shouldSkipCrmSync(req?: { context?: Record<string, unknown> }): boolean {
  if (!req?.context) return false;
  return Boolean(req.context.skipCrmSync || req.context.isCrmSyncWorker);
}

export async function enqueueCrmSyncEvent({
  payload,
  req,
  entityType,
  entityId,
  action,
  dedupeKey,
  payloadSnapshot,
  priority = 50,
  sourceCollection,
}: EnqueueCrmSyncEventInput): Promise<{ created: boolean; id?: string | number }> {
  if (!entityId || !dedupeKey) {
    return { created: false };
  }

  if (shouldSkipCrmSync(req)) {
    return { created: false };
  }

  try {
    const existing = await payload.find({
      collection: CRM_SYNC_COLLECTION,
      where: {
        dedupeKey: { equals: dedupeKey },
      },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      return { created: false, id: existing.docs[0].id };
    }

    const created = await payload.create({
      collection: CRM_SYNC_COLLECTION,
      data: {
        entityType,
        entityId,
        action,
        dedupeKey,
        status: 'pending',
        priority,
        attempts: 0,
        nextRetryAt: new Date().toISOString(),
        payloadSnapshot: payloadSnapshot ?? null,
        sourceCollection,
      },
      overrideAccess: true,
      context: {
        ...(req?.context || {}),
        skipCrmSync: true,
      },
    });

    return { created: true, id: (created as { id?: string | number }).id };
  } catch (error) {
    console.error('[crm][enqueue] failed:', safeErrorMessage(error));
    return { created: false };
  }
}

export async function fetchPendingCrmEvents(
  payload: {
    find: (args: any) => Promise<{ docs: unknown[] }>;
  },
  batchSize: number,
  nowIso: string,
  staleLockBeforeIso: string,
): Promise<CrmSyncEventDoc[]> {
  const result = await payload.find({
    collection: CRM_SYNC_COLLECTION,
    where: {
      or: [
        { status: { equals: 'pending' } },
        {
          and: [
            { status: { equals: 'failed' } },
            { nextRetryAt: { less_than_equal: nowIso } },
          ],
        },
        {
          and: [
            { status: { equals: 'processing' } },
            { lockedAt: { less_than_equal: staleLockBeforeIso } },
          ],
        },
      ],
    },
    sort: 'priority',
    limit: batchSize,
    overrideAccess: true,
  });

  return (result.docs || []) as CrmSyncEventDoc[];
}

export async function markCrmEventStatus(
  payload: {
    update: (args: any) => Promise<unknown>;
  },
  eventId: string | number,
  status: CrmEventStatus,
  patch: Record<string, unknown> = {},
): Promise<void> {
  await payload.update({
    collection: CRM_SYNC_COLLECTION,
    id: eventId,
    data: {
      status,
      ...patch,
    },
    overrideAccess: true,
    context: {
      skipCrmSync: true,
      isCrmSyncWorker: true,
    },
  });
}

export async function markCrmEventProcessing(
  payload: {
    update: (args: any) => Promise<unknown>;
  },
  event: CrmSyncEventDoc,
): Promise<number> {
  const nextAttempts = (event.attempts || 0) + 1;
  await markCrmEventStatus(payload, event.id, 'processing', {
    attempts: nextAttempts,
    lockedAt: new Date().toISOString(),
    lastError: null,
  });
  return nextAttempts;
}

export async function markCrmEventDone(
  payload: {
    update: (args: any) => Promise<unknown>;
  },
  eventId: string | number,
  resultSnapshot?: unknown,
): Promise<void> {
  await markCrmEventStatus(payload, eventId, 'done', {
    processedAt: new Date().toISOString(),
    lockedAt: null,
    nextRetryAt: null,
    lastError: null,
    resultSnapshot: resultSnapshot ?? null,
  });
}

export async function markCrmEventFailure(
  payload: {
    update: (args: any) => Promise<unknown>;
  },
  params: {
    event: CrmSyncEventDoc;
    maxAttempts: number;
    error: unknown;
  },
): Promise<{ deadLettered: boolean; message: string }> {
  const { event, maxAttempts, error } = params;
  const message = safeErrorMessage(error);
  const attempts = event.attempts || 0;

  if (attempts >= maxAttempts) {
    await markCrmEventStatus(payload, event.id, 'dead_letter', {
      processedAt: new Date().toISOString(),
      lockedAt: null,
      lastError: message,
      nextRetryAt: null,
    });
    return { deadLettered: true, message };
  }

  const delayMin = computeRetryDelayMinutes(attempts);
  const retryAt = new Date(Date.now() + delayMin * 60_000).toISOString();

  await markCrmEventStatus(payload, event.id, 'failed', {
    lockedAt: null,
    lastError: message,
    nextRetryAt: retryAt,
  });

  return { deadLettered: false, message };
}
