import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrB2BManager } from '../lib/access-control.ts';

export const CompanyGroupMembers: CollectionConfig = {
  slug: 'company-group-members',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAdminOrB2BManager,
    create: isAdminOrB2BManager,
    update: isAdminOrB2BManager,
    delete: isAdminOrB2BManager,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'company-groups',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Group Admin', value: 'admin' },
      ],
      defaultValue: 'member',
      required: true,
    },
    { name: 'addedBy', type: 'relationship', relationTo: 'users' },
  ],
};
