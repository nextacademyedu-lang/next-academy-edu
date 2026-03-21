import type { CrmEntityType } from './types.ts';

export function isCrmEnabled(): boolean {
  return Boolean(
    process.env.TWENTY_CRM_URL?.trim() &&
      process.env.TWENTY_CRM_API_KEY?.trim(),
  );
}

export function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export function buildExternalId(entityType: CrmEntityType, entityId: string | number): string {
  return `nextacademy:${entityType}:${String(entityId)}`;
}

export function safeErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return String(error).slice(0, 1000);
}

export function computeRetryDelayMinutes(nextAttemptNumber: number): number {
  // attempt #1 -> 5 min, #2 -> 20 min, #3 -> 60 min, then 180 min cap
  if (nextAttemptNumber <= 1) return 5;
  if (nextAttemptNumber === 2) return 20;
  if (nextAttemptNumber === 3) return 60;
  return 180;
}

export function normalizeId(value: unknown): string | null {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === 'string' || typeof id === 'number') return String(id);
  }
  return null;
}

export function toIso(input: unknown): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string') return input;
  if (input instanceof Date) return input.toISOString();
  return undefined;
}

export function trimTo(value: string | undefined, maxLength: number): string | undefined {
  if (!value) return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

