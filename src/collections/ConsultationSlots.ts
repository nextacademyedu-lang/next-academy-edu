import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const ConsultationSlots: CollectionConfig = {
  slug: 'consultation-slots',
  admin: { useAsTitle: 'date' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'consultationType', type: 'relationship', relationTo: 'consultation-types', required: true },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'startTime', type: 'text', required: true },
    { name: 'endTime', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['available', 'booked', 'blocked', 'cancelled'],
      defaultValue: 'available',
      required: true,
    },
  ],
};
