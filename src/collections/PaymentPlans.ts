import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const PaymentPlans: CollectionConfig = {
  slug: 'payment-plans',
  admin: { useAsTitle: 'name' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'nameEn', type: 'text' },
    { name: 'installmentsCount', type: 'number', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'installments',
      type: 'array',
      required: true,
      fields: [
        { name: 'installmentNumber', type: 'number', required: true },
        { name: 'percentage', type: 'number', required: true },
        { name: 'dueDaysFromBooking', type: 'number', required: true, defaultValue: 0 },
        { name: 'description', type: 'text' },
      ],
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
