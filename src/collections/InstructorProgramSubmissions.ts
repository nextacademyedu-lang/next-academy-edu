import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminRequest } from '../lib/access-control.ts';
import {
  sendInstructorProgramApproved,
  sendInstructorProgramRejected,
} from '../lib/email/instructor-emails.ts';

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
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        const previousStatus =
          typeof previousDoc?.status === 'string' ? previousDoc.status : null;
        const nextStatus = typeof doc?.status === 'string' ? doc.status : null;
        const hasStatusTransition =
          operation === 'update' &&
          !!nextStatus &&
          previousStatus !== nextStatus &&
          (nextStatus === 'approved' || nextStatus === 'rejected');

        if (!hasStatusTransition) return;

        const submittedById =
          typeof doc.submittedBy === 'object' && doc.submittedBy && 'id' in doc.submittedBy
            ? (doc.submittedBy as { id: string | number }).id
            : (doc.submittedBy as string | number | null);
        const instructorId =
          typeof doc.instructor === 'object' && doc.instructor && 'id' in doc.instructor
            ? (doc.instructor as { id: string | number }).id
            : (doc.instructor as string | number | null);

        if (!submittedById || !instructorId) return;

        const [userDoc, instructorDoc] = await Promise.all([
          req.payload.findByID({
            collection: 'users',
            id: submittedById,
            depth: 0,
            overrideAccess: true,
            req,
          }),
          req.payload.findByID({
            collection: 'instructors',
            id: instructorId,
            depth: 0,
            overrideAccess: true,
            req,
          }),
        ]);

        const user = userDoc as {
          email?: string | null;
          firstName?: string | null;
          lastName?: string | null;
          preferredLanguage?: string | null;
        } | null;
        const instructor = instructorDoc as
          | {
              firstName?: string | null;
              lastName?: string | null;
            }
          | null;

        const recipientEmail =
          typeof user?.email === 'string' && user.email.trim().length > 0
            ? user.email.trim()
            : null;
        if (!recipientEmail) return;

        const userName =
          `${user?.firstName || instructor?.firstName || ''} ${user?.lastName || instructor?.lastName || ''}`.trim() ||
          recipientEmail;
        const locale = user?.preferredLanguage === 'en' ? 'en' : 'ar';
        const programTitle =
          (typeof doc.titleAr === 'string' && doc.titleAr.trim()) ||
          (typeof doc.titleEn === 'string' && doc.titleEn.trim()) ||
          'Program';

        try {
          if (nextStatus === 'approved') {
            await sendInstructorProgramApproved({
              to: recipientEmail,
              userName,
              locale,
              programTitle,
            });
          } else if (nextStatus === 'rejected') {
            await sendInstructorProgramRejected({
              to: recipientEmail,
              userName,
              locale,
              programTitle,
              reason:
                typeof doc.reviewNotes === 'string' ? doc.reviewNotes : null,
            });
          }
        } catch (emailErr) {
          console.error(
            `[InstructorProgramSubmissions.afterChange] Failed sending ${nextStatus} email for submission #${doc.id}.`,
            emailErr,
          );
        }
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
    { name: 'titleEn', type: 'text', required: true },
    { name: 'shortDescriptionAr', type: 'textarea', required: true },
    { name: 'shortDescriptionEn', type: 'textarea', required: true },
    { name: 'descriptionAr', type: 'textarea', required: true },
    { name: 'descriptionEn', type: 'textarea', required: true },
    { name: 'categoryName', type: 'text', required: true },
    { name: 'durationHours', type: 'number', required: true },
    { name: 'sessionsCount', type: 'number', required: true },
    { name: 'language', type: 'select', options: ['ar', 'en', 'both'], defaultValue: 'ar', required: true },
    { name: 'level', type: 'select', options: ['beginner', 'intermediate', 'advanced'], required: true },
    { name: 'price', type: 'number', required: true },
    { name: 'currency', type: 'select', options: ['EGP', 'USD', 'EUR'], defaultValue: 'EGP', required: true },
    { name: 'objectivesText', type: 'textarea', required: true },
    { name: 'requirementsText', type: 'textarea', required: true },
    { name: 'targetAudienceText', type: 'textarea', required: true },
    { name: 'previousTraineesCount', type: 'number', required: true },
    { name: 'isFirstTimeProgram', type: 'select', options: ['yes', 'no'], required: true },
    { name: 'teachingExperienceYears', type: 'number', required: true },
    { name: 'deliveryHistoryText', type: 'textarea', required: true },
    {
      name: 'sessionOutline',
      type: 'array',
      fields: [
        { name: 'sessionNumber', type: 'number' },
        { name: 'title', type: 'text', required: true },
        { name: 'summary', type: 'textarea' },
      ],
    },
    { name: 'extraNotes', type: 'textarea', required: true },
    { name: 'roundsCount', type: 'number', required: true, admin: { description: 'How many rounds/cohorts planned' } },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: { description: 'Supporting files: syllabus, slides, sample materials' },
    },
  ],
};
