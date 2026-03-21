import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrB2BManager } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const BulkSeatAllocations: CollectionConfig = {
  slug: 'bulk-seat-allocations',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrB2BManager,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        const action = operation === 'create'
          ? 'bulk_seat_allocation_created'
          : 'bulk_seat_allocation_updated';

        const activeAllocations = Array.isArray(doc.allocations)
          ? doc.allocations.filter((entry: { status?: string } | null | undefined) => entry?.status !== 'cancelled').length
          : 0;

        const fingerprint = [
          doc.updatedAt || doc.createdAt || '',
          doc.status || '',
          doc.totalSeats ?? '',
          activeAllocations,
        ].join('|');

        await enqueueCrmSyncEvent({
          payload: req.payload,
          req,
          entityType: 'bulk_seat_allocation',
          entityId: String(doc.id),
          action,
          dedupeKey: createCrmDedupeKey({
            entityType: 'bulk_seat_allocation',
            entityId: String(doc.id),
            action,
            fingerprint,
          }),
          priority: 28,
          sourceCollection: 'bulk-seat-allocations',
          payloadSnapshot: {
            id: doc.id,
            company: doc.company,
            round: doc.round,
            totalSeats: doc.totalSeats,
            status: doc.status,
            activeAllocations,
            updatedAt: doc.updatedAt,
          },
        });
      },
    ],
  },
  fields: [
    /* ── Relationships ────────────────────────────────────── */
    { name: 'company', type: 'relationship', relationTo: 'companies', required: true, index: true },
    { name: 'round',   type: 'relationship', relationTo: 'rounds',    required: true },

    /* ── Seat capacity ───────────────────────────────────── */
    {
      name: 'totalSeats',
      type: 'number',
      required: true,
      min: 1,
      admin: { description: 'Number of seats purchased for this round' },
    },

    /* ── Status ───────────────────────────────────────────── */
    {
      name: 'status',
      type: 'select',
      options: ['active', 'expired', 'cancelled'],
      defaultValue: 'active',
      required: true,
    },

    /* ── Allocations (array of individual seat assignments) ─ */
    {
      name: 'allocations',
      type: 'array',
      fields: [
        { name: 'user', type: 'relationship', relationTo: 'users', required: true },
        { name: 'allocatedAt', type: 'date', admin: { readOnly: true } },
        {
          name: 'status',
          type: 'select',
          options: ['pending', 'enrolled', 'cancelled'],
          defaultValue: 'pending',
          required: true,
        },
      ],
    },

    /* ── Notes / metadata ────────────────────────────────── */
    { name: 'purchaseDate', type: 'date' },
    { name: 'notes',        type: 'textarea' },
  ],
};
