import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/access-control.ts';

export const InstructorAgreements: CollectionConfig = {
  slug: 'instructor-agreements',
  admin: {
    useAsTitle: 'version',
    defaultColumns: ['instructor', 'version', 'acceptedAt'],
    description: 'Immutable audit trail of signed instructor agreements.',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: () => false, // Immutable — cannot be edited
    delete: () => false, // Cannot be deleted
  },
  fields: [
    {
      name: 'instructor',
      type: 'relationship',
      relationTo: 'instructors',
      required: true,
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      admin: { description: 'Agreement version (e.g. "v1.0")' },
    },
    {
      name: 'acceptedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'clausesAccepted',
      type: 'json',
      admin: {
        description: 'JSON array of clause IDs the instructor accepted individually.',
      },
    },
    {
      name: 'termsSnapshot',
      type: 'textarea',
      admin: {
        description: 'Frozen copy of the agreement terms at the time of signing (plain text).',
      },
    },
  ],
};
