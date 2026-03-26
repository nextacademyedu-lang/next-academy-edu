import type { CollectionConfig } from 'payload';
import { isAdminOrOwner, isAuthenticated, isAdmin } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const Waitlist: CollectionConfig = {
  slug: 'waitlist',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrOwner,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        try {
          let action = operation === 'create' ? 'waitlist_joined' : 'waitlist_updated';
          if (operation === 'update' && previousDoc?.status !== doc.status) {
            switch (doc.status) {
              case 'notified':
                action = 'waitlist_notified';
                break;
              case 'expired':
                action = 'waitlist_expired';
                break;
              case 'converted':
                action = 'waitlist_converted';
                break;
              default:
                action = 'waitlist_status_updated';
            }
          }

          const fingerprint = [
            doc.updatedAt || doc.createdAt || '',
            doc.status || '',
            doc.position ?? '',
            doc.notifiedAt || '',
            doc.expiresAt || '',
          ].join('|');

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'waitlist',
            entityId: String(doc.id),
            action,
            dedupeKey: createCrmDedupeKey({
              entityType: 'waitlist',
              entityId: String(doc.id),
              action,
              fingerprint,
            }),
            priority: 40,
            sourceCollection: 'waitlist',
            payloadSnapshot: {
              id: doc.id,
              user: doc.user,
              round: doc.round,
              status: doc.status,
              position: doc.position,
              notifiedAt: doc.notifiedAt,
              expiresAt: doc.expiresAt,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[Waitlist] afterChange CRM sync failed (non-blocking):', err);
        }
      },
    ],
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'position', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['waiting', 'notified', 'expired', 'converted'],
      defaultValue: 'waiting',
      required: true,
    },
    { name: 'notifiedAt', type: 'date' },
    { name: 'expiresAt', type: 'date' },
  ],
};
