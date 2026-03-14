import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic, isAdminOrOwnInstructor } from '../lib/access-control.ts';

export const ConsultationAvailability: CollectionConfig = {
  slug: 'consultation-availability',
  admin: { useAsTitle: 'dayOfWeek' },
  access: {
    read: isPublic,
    create: isAdminOrOwnInstructor,
    update: isAdminOrOwnInstructor,
    delete: isAdminOrOwnInstructor,
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      options: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    { name: 'startTime', type: 'text', required: true },
    { name: 'endTime', type: 'text', required: true },
    { name: 'bufferMinutes', type: 'number', defaultValue: 15 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
