import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: { useAsTitle: 'firstName' },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        let action = operation === 'create' ? 'lead_created' : 'lead_updated';
        if (operation === 'update') {
          if (previousDoc?.status !== doc.status) {
            if (doc.status === 'converted') action = 'lead_converted';
            else if (doc.status === 'lost') action = 'lead_lost';
            else action = 'lead_status_updated';
          }
        }

        const fingerprint = [
          doc.updatedAt || doc.createdAt || '',
          doc.status || '',
          doc.priority || '',
          doc.convertedAt || '',
        ].join('|');

        await enqueueCrmSyncEvent({
          payload: req.payload,
          req,
          entityType: 'lead',
          entityId: String(doc.id),
          action,
          dedupeKey: createCrmDedupeKey({
            entityType: 'lead',
            entityId: String(doc.id),
            action,
            fingerprint,
          }),
          priority: 15,
          sourceCollection: 'leads',
          payloadSnapshot: {
            id: doc.id,
            status: doc.status,
            source: doc.source,
            priority: doc.priority,
            convertedUser: doc.convertedUser,
            updatedAt: doc.updatedAt,
          },
        });
      },
    ],
  },
  fields: [
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'text', required: true },
    { name: 'company', type: 'text' },
    { name: 'jobTitle', type: 'text' },
    {
      name: 'source',
      type: 'select',
      options: ['whatsapp', 'facebook', 'instagram', 'linkedin', 'referral', 'cold_call', 'event', 'other'],
      required: true,
    },
    { name: 'sourceDetails', type: 'text' },
    {
      name: 'status',
      type: 'select',
      options: ['new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost'],
      defaultValue: 'new',
      required: true,
    },
    { name: 'interestedIn', type: 'relationship', relationTo: 'programs', hasMany: true },
    { name: 'notes', type: 'textarea' },
    { name: 'twentyCrmLeadId', type: 'text', admin: { readOnly: true } },
    { name: 'convertedUser', type: 'relationship', relationTo: 'users' },
    { name: 'convertedAt', type: 'date' },
    { name: 'assignedTo', type: 'relationship', relationTo: 'users' },
    { name: 'lastContactDate', type: 'date' },
    { name: 'nextFollowUpDate', type: 'date' },
    {
      name: 'priority',
      type: 'select',
      options: ['low', 'medium', 'high', 'urgent'],
      defaultValue: 'medium',
    },
    { name: 'lostReason', type: 'textarea' },
  ],
};
