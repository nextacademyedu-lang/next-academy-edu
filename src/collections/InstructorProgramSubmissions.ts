import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminRequest } from '../lib/access-control.ts';

export const InstructorProgramSubmissions: CollectionConfig = {
  slug: 'instructor-program-submissions',
  admin: {
    useAsTitle: 'titleAr',
    defaultColumns: ['titleAr', 'type', 'sessionsCount', 'status', 'instructor', 'submittedAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, originalDoc }) => {
        const next = { ...(data || {}) } as Record<string, unknown>;
        const prevStatus =
          typeof originalDoc?.status === 'string' ? originalDoc.status : 'draft';
        const nextStatus =
          typeof next.status === 'string' ? next.status : prevStatus;
        const isAdminActor = await isAdminRequest(req);

        if (isAdminActor) {
          if (nextStatus === 'approved' && prevStatus !== 'approved') {
            next.reviewedAt = new Date().toISOString();
          } else if (nextStatus === 'rejected' && prevStatus !== 'rejected') {
            next.reviewedAt = new Date().toISOString();
          }
          return next;
        }

        // Non-admin writes are expected only through server routes with explicit scope checks.
        // Prevent privilege escalation on direct API calls.
        if (nextStatus === 'approved' || nextStatus === 'rejected') {
          next.status = prevStatus;
        }

        return next;
      },
    ],
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'submittedBy', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'pending', 'approved', 'rejected'],
      defaultValue: 'draft',
      required: true,
    },
    { name: 'submittedAt', type: 'date' },
    { name: 'reviewedAt', type: 'date' },
    { name: 'reviewNotes', type: 'textarea' },

    { name: 'type', type: 'select', options: ['workshop', 'course', 'webinar', 'event', 'camp', 'retreat', 'corporate_training'], required: true },
    { name: 'titleAr', type: 'text', required: true },
    { name: 'titleEn', type: 'text' },
    { name: 'shortDescriptionAr', type: 'textarea', required: true },
    { name: 'shortDescriptionEn', type: 'textarea' },
    { name: 'descriptionAr', type: 'textarea', required: true },
    { name: 'descriptionEn', type: 'textarea' },
    { name: 'categoryName', type: 'text' },
    { name: 'durationHours', type: 'number' },
    { name: 'sessionsCount', type: 'number', required: true },
    { name: 'language', type: 'select', options: ['ar', 'en', 'both'], defaultValue: 'ar' },
    { name: 'level', type: 'select', options: ['beginner', 'intermediate', 'advanced'] },
    { name: 'price', type: 'number' },
    { name: 'currency', type: 'select', options: ['EGP', 'USD', 'EUR'], defaultValue: 'EGP' },
    { name: 'objectivesText', type: 'textarea' },
    { name: 'requirementsText', type: 'textarea' },
    { name: 'targetAudienceText', type: 'textarea' },
    {
      name: 'sessionOutline',
      type: 'array',
      fields: [
        { name: 'sessionNumber', type: 'number' },
        { name: 'title', type: 'text', required: true },
        { name: 'summary', type: 'textarea' },
      ],
    },
    { name: 'extraNotes', type: 'textarea' },
  ],
};
