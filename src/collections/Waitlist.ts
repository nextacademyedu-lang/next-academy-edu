import type { CollectionConfig } from 'payload';
import { isAdminOrOwner, isAuthenticated, isAdmin } from '../lib/access-control.ts';

export const Waitlist: CollectionConfig = {
  slug: 'waitlist',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrOwner,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
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
