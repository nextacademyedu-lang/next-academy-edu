import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminRequest, isPublic } from '../lib/access-control.ts';
import {
  linkUserToInstructor,
  normalizeEmail,
} from '../lib/instructor-account-link.ts';

export const Instructors: CollectionConfig = {
  slug: 'instructors',
  admin: { useAsTitle: 'firstName' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      async ({ req, data, originalDoc, operation, context }) => {
        const next = { ...(data || {}) } as Record<string, unknown>;
        const isAdminActor = await isAdminRequest(req);
        const isSelfServiceActor = Boolean(
          (context as { selfServiceInstructorProfile?: boolean } | undefined)?.selfServiceInstructorProfile,
        );
        const actorRole =
          typeof (req as { user?: { role?: unknown } }).user?.role === 'string'
            ? ((req as { user?: { role?: string } }).user?.role as string)
            : '';
        const enforceSelfServiceRules = !isAdminActor && (isSelfServiceActor || actorRole === 'instructor');
        const previousStatus =
          typeof originalDoc?.verificationStatus === 'string'
            ? originalDoc.verificationStatus
            : 'approved';
        const nextStatus =
          typeof next.verificationStatus === 'string'
            ? next.verificationStatus
            : previousStatus;

        if (enforceSelfServiceRules) {
          next.isActive = false;
          if (!next.verificationStatus) next.verificationStatus = operation === 'create' ? 'draft' : previousStatus;
          if (nextStatus === 'approved' || nextStatus === 'rejected') {
            next.verificationStatus = previousStatus;
          }
          return next;
        }

        if (nextStatus === 'approved' && previousStatus !== 'approved') {
          next.approvedAt = new Date().toISOString();
          next.rejectedAt = null;
          next.rejectionReason = null;
          next.isActive = true;
        } else if (nextStatus === 'rejected' && previousStatus !== 'rejected') {
          next.rejectedAt = new Date().toISOString();
          next.approvedAt = null;
          next.isActive = false;
        } else if (nextStatus === 'pending' && previousStatus !== 'pending') {
          next.submittedAt = new Date().toISOString();
          next.approvedAt = null;
          next.rejectedAt = null;
          next.isActive = false;
        } else if (nextStatus === 'draft' && previousStatus !== 'draft') {
          next.approvedAt = null;
          next.rejectedAt = null;
          next.isActive = false;
        }

        return next;
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation, context }) => {
        const skipInstructorAutoLink = Boolean(
          (context as { skipInstructorAutoLink?: boolean } | undefined)?.skipInstructorAutoLink,
        );
        if (skipInstructorAutoLink) return;

        const normalizedEmail = normalizeEmail(doc.email);
        if (!normalizedEmail) return;

        const previousEmail = normalizeEmail(previousDoc?.email);
        const emailChanged = normalizedEmail !== previousEmail;
        if (operation !== 'create' && !emailChanged) return;

        const users = await req.payload.find({
          collection: 'users',
          where: {
            and: [
              { email: { equals: normalizedEmail } },
              { emailVerified: { equals: true } },
            ],
          },
          depth: 0,
          limit: 2,
          overrideAccess: true,
          req,
        });

        if (!users.docs.length) return;

        if (users.docs.length > 1) {
          console.warn(
            `[Instructors.afterChange] Multiple users share email "${normalizedEmail}". Auto-link skipped.`,
          );
          return;
        }

        const user = users.docs[0] as {
          id: number | string;
          email?: string | null;
          role?: string | null;
          emailVerified?: boolean | null;
          instructorId?: unknown;
        };

        await linkUserToInstructor({
          payload: req.payload,
          req,
          user,
          instructorId: doc.id,
          source: 'Instructors.afterChange',
        });
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        const deleteByInstructor = async (collection: string) => {
          const found = await req.payload.find({
            collection: collection as any,
            where: { instructor: { equals: id } },
            depth: 0,
            limit: 500,
            overrideAccess: true,
            req,
          });
          for (const doc of found.docs) {
            await req.payload.delete({
              collection: collection as any,
              id: (doc as { id: number | string }).id,
              overrideAccess: true,
              req,
            });
          }
        };
        await deleteByInstructor('instructor-blocked-dates');
        await deleteByInstructor('consultation-availability');
        await deleteByInstructor('consultation-bookings');
        await deleteByInstructor('instructor-program-submissions');
        await deleteByInstructor('consultation-slots');
        // Delete consultation types last (slots reference them)
        await deleteByInstructor('consultation-types');
      },
    ],
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'bioAr', type: 'richText' },
    { name: 'bioEn', type: 'richText' },
    { name: 'jobTitle', type: 'text' },
    { name: 'tagline', type: 'text' },
    { name: 'picture', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'twitterUrl', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'featuredOrder', type: 'number' },
    {
      name: 'verificationStatus',
      type: 'select',
      options: ['draft', 'pending', 'approved', 'rejected'],
      defaultValue: 'approved',
      admin: {
        description: 'Instructor profile review status (for self-service onboarding flow).',
      },
    },
    { name: 'submittedAt', type: 'date' },
    { name: 'approvedAt', type: 'date' },
    { name: 'rejectedAt', type: 'date' },
    { name: 'rejectionReason', type: 'textarea' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },

    /* ── Onboarding & Agreement ──────────────────────────────── */
    { name: 'onboardingCompleted', type: 'checkbox', defaultValue: false },
    { name: 'agreementAccepted', type: 'checkbox', defaultValue: false },
    { name: 'agreementAcceptedAt', type: 'date' },
    {
      name: 'agreementVersion',
      type: 'text',
      defaultValue: 'v1.2',
      admin: { description: 'Version of agreement terms accepted' },
    },

    /* ── Revenue Share ────────────────────────────────────────── */
    {
      name: 'courseRevenueShare',
      type: 'number',
      defaultValue: 33,
      admin: { description: 'Instructor\'s percentage from total course/workshop price (default: 33%)' },
    },
    {
      name: 'consultationRevenueShare',
      type: 'number',
      defaultValue: 50,
      admin: { description: 'Instructor\'s percentage from consultation revenue (default: 50%)' },
    },
  ],
};
