import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthenticated, isPublic } from '../lib/access-control.ts';

export const Companies: CollectionConfig = {
  slug: 'companies',
  admin: { useAsTitle: 'name' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'industry', type: 'text' },
    {
      name: 'size',
      type: 'select',
      options: ['1-10', '11-50', '51-200', '201-500', '500+'],
    },
    {
      name: 'type',
      type: 'select',
      options: ['startup', 'sme', 'enterprise', 'government', 'freelancer'],
    },
    { name: 'website', type: 'text' },
    { name: 'country', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'twentyCrmCompanyId', type: 'text', admin: { readOnly: true } },
  ],
};
