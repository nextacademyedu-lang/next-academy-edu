import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrB2BManager } from '../lib/access-control.ts';

export const CompanyPolicies: CollectionConfig = {
  slug: 'company-policies',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrB2BManager,
    create: isAdmin,
    update: isAdminOrB2BManager,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'allowedPrograms',
      type: 'relationship',
      relationTo: 'programs',
      hasMany: true,
      admin: {
        description: 'Programs this company can book. Empty = all programs allowed.',
      },
    },
    {
      name: 'blockedPrograms',
      type: 'relationship',
      relationTo: 'programs',
      hasMany: true,
      admin: {
        description: 'Programs explicitly blocked for this company.',
      },
    },
    {
      name: 'monthlyBudget',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum spending per month in EGP. 0 or empty = no limit.',
      },
    },
    {
      name: 'requireApproval',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'If true, bookings by company members need manager approval before confirmation.',
      },
    },
    {
      name: 'maxBookingsPerMember',
      type: 'number',
      min: 0,
      admin: {
        description: 'Max active bookings per member per month. 0 or empty = no limit.',
      },
    },
    { name: 'notes', type: 'textarea' },
  ],
};
