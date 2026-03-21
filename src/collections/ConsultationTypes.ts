import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic, isAdminOrOwnInstructor } from '../lib/access-control.ts';

type ConsultationTypeLike = {
  title?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  descriptionEn?: string | null;
};

function firstText(values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
}

export const ConsultationTypes: CollectionConfig = {
  slug: 'consultation-types',
  admin: { useAsTitle: 'titleAr' },
  access: {
    read: isPublic,
    create: isAdminOrOwnInstructor,
    update: isAdminOrOwnInstructor,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const next = { ...(data || {}) } as ConsultationTypeLike;
        const prev = (originalDoc || {}) as ConsultationTypeLike;

        const normalizedTitle = firstText([
          next.title,
          next.titleEn,
          next.titleAr,
          prev.title,
          prev.titleEn,
          prev.titleAr,
        ]);

        const normalizedDescription = firstText([
          next.description,
          next.descriptionEn,
          next.descriptionAr,
          prev.description,
          prev.descriptionEn,
          prev.descriptionAr,
        ]);

        if (normalizedTitle) {
          if (!next.titleAr) next.titleAr = normalizedTitle;
          if (!next.title) next.title = normalizedTitle;
        }

        if (normalizedDescription) {
          if (!next.descriptionAr) next.descriptionAr = normalizedDescription;
          if (!next.description) next.description = normalizedDescription;
        }

        return next;
      },
    ],
    afterRead: [
      ({ doc }) => {
        const current = (doc || {}) as ConsultationTypeLike;
        const title = firstText([current.title, current.titleEn, current.titleAr]);
        const description = firstText([
          current.description,
          current.descriptionEn,
          current.descriptionAr,
        ]);

        return {
          ...doc,
          title: title || '',
          description,
        };
      },
    ],
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'titleAr', type: 'text', required: true },
    { name: 'titleEn', type: 'text' },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Compatibility field used by frontend contract.' },
    },
    { name: 'descriptionAr', type: 'textarea' },
    { name: 'descriptionEn', type: 'textarea' },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Compatibility field used by frontend contract.' },
    },
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
