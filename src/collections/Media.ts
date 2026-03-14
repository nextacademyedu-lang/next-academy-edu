import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  admin: { useAsTitle: 'filename' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
};
