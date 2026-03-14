import type { CollectionConfig } from 'payload';
import { isAdminOrInstructor, isAdminOrOwnInstructor } from '../lib/access-control.ts';

export const InstructorBlockedDates: CollectionConfig = {
  slug: 'instructor-blocked-dates',
  admin: { useAsTitle: 'date' },
  access: {
    read: isAdminOrOwnInstructor,
    create: isAdminOrInstructor,
    update: isAdminOrOwnInstructor,
    delete: isAdminOrOwnInstructor,
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'reason', type: 'text' },
  ],
};
