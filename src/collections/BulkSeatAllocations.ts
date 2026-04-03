import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrB2BManager } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const BulkSeatAllocations: CollectionConfig = {
  slug: 'bulk-seat-allocations',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrB2BManager,
    create: isAdminOrB2BManager,
    update: isAdminOrB2BManager,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, operation }) => {
        try {
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
              allocationMode: doc.allocationMode,
              activeAllocations,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[BulkSeatAllocations] afterChange CRM sync failed (non-blocking):', err);
        }
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
      admin: { description: 'Total seats purchased for this round' },
    },
    {
      name: 'openPoolSeats',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: { description: 'How many seats are available as open pool (self-claim by company members). Rest are manager-assigned.' },
    },

    /* ── Allocation mode ─────────────────────────────────── */
    {
      name: 'allocationMode',
      type: 'select',
      options: [
        { label: 'Assigned (Manager picks)', value: 'assigned' },
        { label: 'Open Pool (Members claim)', value: 'open_pool' },
        { label: 'Mixed (Both)', value: 'mixed' },
      ],
      defaultValue: 'mixed',
      required: true,
    },

    /* ── Status ───────────────────────────────────────────── */
    {
      name: 'status',
      type: 'select',
      options: ['active', 'expired', 'cancelled'],
      defaultValue: 'active',
      required: true,
    },

    /* ── Who created it ──────────────────────────────────── */
    { name: 'createdByManager', type: 'relationship', relationTo: 'users' },

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
        {
          name: 'source',
          type: 'select',
          options: [
            { label: 'Manager assigned', value: 'assigned' },
            { label: 'Self-claimed from pool', value: 'pool_claim' },
          ],
          defaultValue: 'assigned',
        },
      ],
    },

    /* ── Notes / metadata ────────────────────────────────── */
    { name: 'purchaseDate', type: 'date' },
    { name: 'notes',        type: 'textarea' },
  ],
};
