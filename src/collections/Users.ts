import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf, isAdminRequest } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';
import {
  findInstructorIdByEmail,
  linkUserToInstructor,
  normalizeEmail,
  relationToId,
} from '../lib/instructor-account-link.ts';
import { autoAcceptInvitationByEmail } from '../lib/company-invitations.ts';

function parseConfiguredAdminEmails(): string[] {
  const raw = process.env.PAYLOAD_ADMIN_EMAIL || '';
  return raw
    .split(/[,\s;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isConfiguredAdminEmail(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const email = value.trim().toLowerCase();
  if (!email) return false;
  return parseConfiguredAdminEmails().includes(email);
}

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    useAPIKey: true,
    maxLoginAttempts: 10,
    lockTime: 600 * 1000, // 10 minutes
  },
  admin: { useAsTitle: 'email' },
  access: {
    read: isAdminOrSelf,
    create: () => true,
    update: isAdminOrSelf,
    delete: isAdmin,
    // Only admins can access the admin panel for this collection
    admin: async ({ req }) => isAdminRequest(req),
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const targetUser = await req.payload
          .findByID({
            collection: 'users',
            id,
            depth: 0,
            overrideAccess: true,
            req,
          })
          .catch(() => null);

        const normalizedEmail =
          typeof targetUser?.email === 'string' && targetUser.email.trim()
            ? targetUser.email.trim().toLowerCase()
            : null;

        const deleteByFieldValue = async (
          collection: string,
          field: string,
          value: number | string | null,
        ) => {
          if (value === null || value === '') return;

          let found: { docs: Array<{ id: number | string }> };
          try {
            found = (await req.payload.find({
              collection: collection as any,
              where: { [field]: { equals: value } },
              depth: 0,
              limit: 1000,
              overrideAccess: true,
              req,
            })) as { docs: Array<{ id: number | string }> };
          } catch (err) {
            console.warn(
              `[Users.beforeDelete] Skipping ${collection} cleanup by field "${field}" for user #${id}.`,
              err,
            );
            return;
          }

          for (const doc of found.docs) {
            try {
              await req.payload.delete({
                collection: collection as any,
                id: doc.id,
                overrideAccess: true,
                req,
              });
            } catch (err) {
              console.warn(
                `[Users.beforeDelete] Failed deleting ${collection} #${doc.id} while cleaning user #${id}.`,
                err,
              );
            }
          }
        };

        // Order matters: bookings -> reviews/payments (handled by Bookings beforeDelete)
        await deleteByFieldValue('bookings', 'user', id);
        await deleteByFieldValue('user-profiles', 'user', id);
        await deleteByFieldValue('notifications', 'user', id);
        await deleteByFieldValue('waitlist', 'user', id);
        await deleteByFieldValue('installment-requests', 'user', id);
        await deleteByFieldValue('installment-requests', 'reviewedBy', id);
        await deleteByFieldValue('verification-codes', 'email', normalizedEmail);
        await deleteByFieldValue('company-invitations', 'email', normalizedEmail);
        await deleteByFieldValue('consultation-bookings', 'user', id);
        await deleteByFieldValue('instructor-program-submissions', 'submittedBy', id);
      },
    ],
    beforeChange: [
      async ({ req, data, originalDoc, operation, context }) => {
        const isAdminActor = await isAdminRequest(req);
        const hasPrivilegedRoleWriteBypass =
          Boolean((context as { allowPrivilegedRoleWrite?: boolean } | undefined)?.allowPrivilegedRoleWrite);
        const canWritePrivilegedRole = isAdminActor || hasPrivilegedRoleWriteBypass;

        const targetEmail =
          (typeof data.email === 'string' && data.email.trim()) ||
          (typeof originalDoc?.email === 'string' && originalDoc.email.trim()) ||
          '';
        const isPinnedAdmin = isConfiguredAdminEmail(targetEmail);

        // Public/self-service create must never be allowed to assign privileged roles.
        if (operation === 'create') {
          const requestedIntent =
            data.signupIntent === 'instructor'
              ? 'instructor'
              : data.signupIntent === 'b2b_manager'
                ? 'b2b_manager'
                : 'student';
          data.signupIntent = requestedIntent;

          if (!canWritePrivilegedRole) {
            data.role = 'user';
            data.instructorId = null;
          } else if (!data.role) {
            data.role = 'user';
          }

          if (isPinnedAdmin) {
            data.role = 'admin';
            data.emailVerified = true;
          }
        }

        // Non-admin / non-bypass updates cannot escalate role or bind instructor profile.
        if (operation === 'update' && originalDoc && !canWritePrivilegedRole) {
          if (data.role && data.role !== originalDoc.role) {
            data.role = originalDoc.role;
          }

          if (data.instructorId !== undefined) {
            data.instructorId = originalDoc.instructorId ?? null;
          }
        }

        // Configured admin emails are pinned to admin and cannot be downgraded.
        if (isPinnedAdmin) {
          data.role = 'admin';
          data.emailVerified = true;
        }

        return data;
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation, context }) => {
        try {
          const skipInstructorAutoLink = Boolean(
            (context as { skipInstructorAutoLink?: boolean } | undefined)?.skipInstructorAutoLink,
          );
          const normalizedEmail = normalizeEmail(doc.email);
          const previousEmail = normalizeEmail(previousDoc?.email);
          const emailChanged = normalizedEmail !== previousEmail;
          const justVerified = Boolean(doc.emailVerified) && !Boolean(previousDoc?.emailVerified);
          const promotedToInstructor = doc.role === 'instructor' && previousDoc?.role !== 'instructor';
          const needsInstructorBinding =
            doc.role === 'instructor' && relationToId(doc.instructorId) === null;
          const explicitlyDemotedFromInstructor =
            operation === 'update' && previousDoc?.role === 'instructor' && doc.role !== 'instructor';

          const shouldAttemptAutoLink =
            !skipInstructorAutoLink &&
            !explicitlyDemotedFromInstructor &&
            doc.role !== 'admin' &&
            Boolean(doc.emailVerified) &&
            Boolean(normalizedEmail) &&
            (operation === 'create' ||
              justVerified ||
              emailChanged ||
              promotedToInstructor ||
              needsInstructorBinding);

          if (shouldAttemptAutoLink && normalizedEmail) {
            const instructorLookup = await findInstructorIdByEmail({
              payload: req.payload,
              req,
              normalizedEmail,
              source: 'Users.afterChange',
            });

            if (instructorLookup.status === 'found') {
              await linkUserToInstructor({
                payload: req.payload,
                req,
                user: {
                  id: doc.id,
                  email: doc.email,
                  role: doc.role,
                  emailVerified: doc.emailVerified,
                  instructorId: doc.instructorId,
                },
                instructorId: instructorLookup.instructorId,
                source: 'Users.afterChange',
              });
            }
          }

          const shouldAttemptCompanyAutoLink =
            doc.role !== 'admin' &&
            Boolean(doc.emailVerified) &&
            Boolean(normalizedEmail) &&
            (operation === 'create' || justVerified || emailChanged);

          if (shouldAttemptCompanyAutoLink) {
            await autoAcceptInvitationByEmail({
              payload: req.payload,
              req: req as any,
              user: {
                id: doc.id,
                email: doc.email,
                role: doc.role,
                emailVerified: doc.emailVerified,
              },
            });
          }

          if (doc.role === 'admin') return;

          let action = operation === 'create' ? 'user_created' : 'user_updated';

          if (operation === 'update') {
            const wasVerified = Boolean(previousDoc?.emailVerified);
            const isVerified = Boolean(doc.emailVerified);
            if (!wasVerified && isVerified) {
              action = 'user_verified';
            } else if (previousDoc?.lifecycleStage !== doc.lifecycleStage) {
              action = 'user_lifecycle_updated';
            }
          }

          const fingerprint = [
            doc.updatedAt || doc.createdAt || '',
            doc.emailVerified ? 'verified' : 'not_verified',
            doc.lifecycleStage || '',
            doc.role || '',
          ].join('|');

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'user',
            entityId: String(doc.id),
            action,
            dedupeKey: createCrmDedupeKey({
              entityType: 'user',
              entityId: String(doc.id),
              action,
              fingerprint,
            }),
            priority: 10,
            sourceCollection: 'users',
            payloadSnapshot: {
              id: doc.id,
              email: doc.email,
              role: doc.role,
              lifecycleStage: doc.lifecycleStage,
              emailVerified: doc.emailVerified,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[Users] afterChange CRM sync failed (non-blocking):', err);
        }
      },
    ],
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    { name: 'gender', type: 'select', options: ['male', 'female'] },
    { name: 'picture', type: 'upload', relationTo: 'media' },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'B2B Manager', value: 'b2b_manager' },
      ],
      defaultValue: 'user',
      required: true,
      // NOTE: field-level access removed — it crashes Payload 3.x admin UI.
      // Role protection is handled by the beforeChange hook above.
    },
    { name: 'instructorId', type: 'relationship', relationTo: 'instructors', hasMany: false },
    {
      name: 'signupIntent',
      type: 'select',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'B2B Manager', value: 'b2b_manager' },
      ],
      defaultValue: 'student',
      required: true,
    },
    { name: 'preferredLanguage', type: 'select', options: ['ar', 'en'], defaultValue: 'ar' },
    { name: 'newsletterOptIn', type: 'checkbox', defaultValue: false },
    { name: 'whatsappOptIn', type: 'checkbox', defaultValue: false },
    {
      name: 'lifecycleStage',
      type: 'select',
      options: ['lead', 'prospect', 'customer', 'repeat'],
      defaultValue: 'lead',
    },
    {
      name: 'contactSource',
      type: 'select',
      options: ['website', 'whatsapp', 'social', 'referral'],
    },
    { name: 'twentyCrmContactId', type: 'text', admin: { readOnly: true } },
    { name: 'googleId', type: 'text', admin: { readOnly: true, description: 'Google OAuth sub ID' } },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false },
    { name: 'lastLogin', type: 'date', admin: { readOnly: true } },
    
    /* ── Native Google Calendar Sync ────────────────────────────── */
    { 
      name: 'googleRefreshToken', 
      type: 'text', 
      admin: { readOnly: true, description: 'User-specific Google Calendar integration refresh token' },
      access: { read: isAdmin, update: isAdmin },
    },
    { 
      name: 'googleAccessToken', 
      type: 'text', 
      admin: { readOnly: true },
      access: { read: isAdmin, update: isAdmin },
    },
    { 
      name: 'googleCalendarConnectedAt', 
      type: 'date', 
      admin: { readOnly: true },
    },
    { 
      name: 'googleCalendarEmail', 
      type: 'text', 
      admin: { readOnly: true },
    },
    { 
      name: 'googleCalendarId', 
      type: 'text', 
      admin: { readOnly: true, description: 'Default calendar ID used for booking creation' },
    },
  ],
};
