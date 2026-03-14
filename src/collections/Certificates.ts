import type { CollectionConfig } from 'payload';
import { isAdminOrOwner, isAdmin } from '../lib/access-control.ts';

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  admin: { useAsTitle: 'certificateCode' },
  access: {
    read: isAdminOrOwner,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'certificateCode', type: 'text', unique: true, required: true, admin: { readOnly: true } },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true },
    { name: 'quizScore', type: 'number' },
    { name: 'passingScore', type: 'number' },
    { name: 'issuedAt', type: 'date', required: true },
    { name: 'pdfUrl', type: 'text' },
    { name: 'verificationUrl', type: 'text', admin: { readOnly: true } },
  ],
};
