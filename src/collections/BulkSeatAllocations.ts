import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrB2BManager } from '../lib/access-control.ts';

export const BulkSeatAllocations: CollectionConfig = {
  slug: 'bulk-seat-allocations',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrB2BManager,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
