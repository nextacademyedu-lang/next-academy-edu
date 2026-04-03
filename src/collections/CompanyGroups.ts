import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrB2BManager } from '../lib/access-control.ts';

export const CompanyGroups: CollectionConfig = {
  slug: 'company-groups',
  admin: { useAsTitle: 'name' },
  access: {
    read: isAdminOrB2BManager,
    create: isAdminOrB2BManager,
    update: isAdminOrB2BManager,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'company',
      type: 'relationship',
      relationTo: 'companies',
      required: true,
      index: true,
    },
    { name: 'description', type: 'textarea' },
    {
      name: 'seatAllocation',
      type: 'number',
      min: 0,
      admin: {
        description: 'Number of seats allocated to this group from the company pool',
      },
    },
    { name: 'createdBy', type: 'relationship', relationTo: 'users' },
  ],
};
