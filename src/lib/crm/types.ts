export type CrmEntityType =
  | 'user'
  | 'user_profile'
  | 'lead'
  | 'company'
  | 'booking'
  | 'payment'
  | 'consultation_booking'
  | 'bulk_seat_allocation'
  | 'waitlist';

export type CrmEventStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'failed'
  | 'dead_letter';

export interface CrmSyncEventDoc {
  id: number | string;
  entityType: CrmEntityType;
  entityId: string;
  action: string;
  dedupeKey: string;
  status: CrmEventStatus;
  priority?: number | null;
  attempts?: number | null;
  nextRetryAt?: string | null;
  lastError?: string | null;
  payloadSnapshot?: unknown;
  resultSnapshot?: unknown;
  sourceCollection?: string | null;
  lockedAt?: string | null;
  processedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnqueueCrmSyncEventInput {
  payload: {
    find: (args: any) => Promise<{
      docs: Array<{ id?: string | number }>;
      totalDocs?: number;
    }>;
    create: (args: any) => Promise<unknown>;
  };
  req?: { context?: Record<string, unknown> };
  entityType: CrmEntityType;
  entityId: string;
  action: string;
  dedupeKey: string;
  payloadSnapshot?: unknown;
  priority?: number;
  sourceCollection?: string;
}

export interface CrmProcessorOptions {
  batchSize?: number;
  maxAttempts?: number;
  staleLockMinutes?: number;
  now?: Date;
}

export interface CrmProcessorResult {
  success: boolean;
  disabled: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  deadLettered: number;
  skipped: number;
  durationMs: number;
  errors: string[];
}
