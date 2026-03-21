import crypto from 'crypto';
import type { CrmEntityType } from './types.ts';

interface CreateCrmDedupeKeyInput {
  entityType: CrmEntityType;
  entityId: string;
  action: string;
  fingerprint?: string;
}

export function createCrmDedupeKey({
  entityType,
  entityId,
  action,
  fingerprint,
}: CreateCrmDedupeKeyInput): string {
  const raw = [entityType, entityId, action, fingerprint ?? ''].join(':');
  const hash = crypto.createHash('sha1').update(raw).digest('hex');
  return `${entityType}:${entityId}:${action}:${hash}`;
}

