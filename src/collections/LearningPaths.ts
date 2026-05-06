import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const LearningPaths: CollectionConfig = {
  slug: 'learning-paths',
  admin: { useAsTitle: 'titleAr' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'titleAr', type: 'text', required: true },
    { name: 'titleEn', type: 'text' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'descriptionAr', type: 'textarea' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'programs', type: 'relationship', relationTo: 'programs', hasMany: true, required: true },
    { name: 'price', type: 'number', admin: { description: 'Override price for the entire bundle. If left empty, it might be calculated dynamically.' } },
    { name: 'currency', type: 'text', defaultValue: 'EGP' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    { name: 'order', type: 'number', defaultValue: 0 },
  ],
};
