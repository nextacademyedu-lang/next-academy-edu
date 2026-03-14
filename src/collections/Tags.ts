import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: { useAsTitle: 'nameAr' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'nameAr', type: 'text', required: true },
    { name: 'nameEn', type: 'text' },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'type',
      type: 'select',
      options: ['interest', 'skill', 'industry', 'topic'],
      required: true,
    },
    { name: 'usageCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
  ],
};
