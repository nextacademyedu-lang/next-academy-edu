import type { CollectionConfig } from 'payload';
import { isPublic, isAuthenticated, isAdminOrOwner, isAdmin } from '../lib/access-control.ts';

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: { useAsTitle: 'id' },
  access: {
    read: isPublic,
    create: isAuthenticated,
    update: isAdminOrOwner,
    delete: isAdmin,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'title', type: 'text' },
    { name: 'comment', type: 'textarea', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'flagged', 'removed'],
      defaultValue: 'pending',
      required: true,
    },
    { name: 'helpfulCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'isVerifiedPurchase', type: 'checkbox', defaultValue: true },
    { name: 'adminNotes', type: 'textarea' },
    { name: 'removedReason', type: 'textarea' },
  ],
};
