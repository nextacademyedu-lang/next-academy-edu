import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Categories: CollectionConfig = {
  slug: 'categories',
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
    { name: 'descriptionAr', type: 'textarea' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'icon', type: 'text' },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
