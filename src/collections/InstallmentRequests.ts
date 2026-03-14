import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwner, isAuthenticated } from '../lib/access-control.ts';

export const InstallmentRequests: CollectionConfig = {
  slug: 'installment-requests',
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
    { name: 'paymentPlan', type: 'relationship', relationTo: 'payment-plans', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'approved', 'rejected', 'expired'],
      defaultValue: 'pending',
      required: true,
    },
    { name: 'reason', type: 'textarea', required: true },
    { name: 'nationalIdNumber', type: 'text' },
    { name: 'nationalIdImage', type: 'upload', relationTo: 'media' },
    { name: 'userNotes', type: 'textarea' },
    { name: 'adminNotes', type: 'textarea' },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users' },
    { name: 'reviewedAt', type: 'date' },
    { name: 'approvalExpiresAt', type: 'date' },
  ],
};
