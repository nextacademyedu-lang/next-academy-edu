import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/access-control.ts';

export const PaymentLinks: CollectionConfig = {
  slug: 'payment-links',
  admin: { useAsTitle: 'title' },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'code', type: 'text', unique: true, required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'paymentPlan', type: 'relationship', relationTo: 'payment-plans' },
    { name: 'discountCode', type: 'text' },
    { name: 'expiresAt', type: 'date' },
    { name: 'maxUses', type: 'number' },
    { name: 'currentUses', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'createdBy', type: 'relationship', relationTo: 'users' },
  ],
};
