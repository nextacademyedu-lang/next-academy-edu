import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

const MEDIA_STATIC_DIR = process.env.PAYLOAD_UPLOAD_DIR || 'media';

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: MEDIA_STATIC_DIR,
  },
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
