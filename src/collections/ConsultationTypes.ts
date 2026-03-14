import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic, isAdminOrOwnInstructor } from '../lib/access-control.ts';

export const ConsultationTypes: CollectionConfig = {
  slug: 'consultation-types',
  admin: { useAsTitle: 'titleAr' },
  access: {
    read: isPublic,
    create: isAdminOrOwnInstructor,
    update: isAdminOrOwnInstructor,
    delete: isAdmin,
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'titleAr', type: 'text', required: true },
    { name: 'titleEn', type: 'text' },
    { name: 'descriptionAr', type: 'textarea' },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'durationMinutes', type: 'number', required: true },
    { name: 'price', type: 'number', required: true },
    { name: 'currency', type: 'select', options: ['EGP', 'USD'], defaultValue: 'EGP' },
    {
      name: 'meetingType',
      type: 'select',
      options: ['online', 'in-person', 'both'],
      defaultValue: 'online',
    },
    { name: 'meetingPlatform', type: 'text' },
    { name: 'maxParticipants', type: 'number', defaultValue: 1 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
