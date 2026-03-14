import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthenticated } from '../lib/access-control.ts';

export const DiscountCodes: CollectionConfig = {
  slug: 'discount-codes',
  admin: { useAsTitle: 'code' },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'code', type: 'text', required: true, unique: true },
    {
      name: 'type',
      type: 'select',
      options: ['percentage', 'fixed'],
      required: true,
    },
    { name: 'value', type: 'number', required: true },
    { name: 'maxUses', type: 'number' },
    { name: 'currentUses', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'validFrom', type: 'date', required: true },
    { name: 'validUntil', type: 'date', required: true },
    {
      name: 'applicableTo',
      type: 'select',
      options: ['all', 'specific_programs', 'specific_categories', 'consultations'],
      defaultValue: 'all',
    },
    { name: 'programs', type: 'relationship', relationTo: 'programs', hasMany: true },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'minPurchaseAmount', type: 'number' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'createdBy', type: 'relationship', relationTo: 'users' },
  ],
};
