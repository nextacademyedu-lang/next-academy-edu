import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/access-control.ts';

export const CrmSyncEvents: CollectionConfig = {
  slug: 'crm-sync-events',
  admin: {
    useAsTitle: 'dedupeKey',
    group: 'System',
    defaultColumns: [
      'entityType',
      'entityId',
      'action',
      'status',
      'attempts',
      'priority',
      'nextRetryAt',
      'updatedAt',
    ],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'entityType',
      type: 'select',
      required: true,
      options: [
        'user',
        'user_profile',
        'lead',
        'company',
        'booking',
        'payment',
        'consultation_booking',
        'bulk_seat_allocation',
        'waitlist',
      ],
      index: true,
    },
    { name: 'entityId', type: 'text', required: true, index: true },
    { name: 'action', type: 'text', required: true, index: true },
    { name: 'dedupeKey', type: 'text', required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'processing', 'done', 'failed', 'dead_letter'],
    },
    { name: 'priority', type: 'number', defaultValue: 50, index: true },
    { name: 'attempts', type: 'number', defaultValue: 0 },
    { name: 'nextRetryAt', type: 'date', index: true },
    { name: 'lastError', type: 'textarea' },
    { name: 'payloadSnapshot', type: 'json' },
    { name: 'resultSnapshot', type: 'json' },
    { name: 'sourceCollection', type: 'text' },
    { name: 'lockedAt', type: 'date', admin: { readOnly: true } },
    { name: 'processedAt', type: 'date', admin: { readOnly: true } },
  ],
};

