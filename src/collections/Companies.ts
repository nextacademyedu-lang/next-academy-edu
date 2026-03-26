import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthenticated, isPublic } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: { useAsTitle: 'name' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        try {
          const action = operation === 'create' ? 'company_created' : 'company_updated';
          const fingerprint = [
            doc.updatedAt || doc.createdAt || '',
            doc.name || '',
            doc.website || '',
          ].join('|');

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'company',
            entityId: String(doc.id),
            action,
            dedupeKey: createCrmDedupeKey({
              entityType: 'company',
              entityId: String(doc.id),
              action,
              fingerprint,
            }),
            priority: 10,
            sourceCollection: 'companies',
            payloadSnapshot: {
              id: doc.id,
              name: doc.name,
              industry: doc.industry,
              size: doc.size,
              type: doc.type,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[Companies] afterChange CRM sync failed (non-blocking):', err);
        }
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'industry', type: 'text' },
    {
      name: 'size',
      type: 'select',
      options: ['1-10', '11-50', '51-200', '201-500', '500+'],
    },
    {
      name: 'type',
      type: 'select',
      options: ['startup', 'sme', 'enterprise', 'government', 'freelancer'],
    },
    { name: 'website', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'twentyCrmCompanyId', type: 'text', admin: { readOnly: true } },
  ],
};
