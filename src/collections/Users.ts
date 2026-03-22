import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf, isAdminRequest } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

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
    beforeChange: [
      async ({ req, data, originalDoc, operation, context }) => {
        const isAdminActor = await isAdminRequest(req);
        const hasPrivilegedRoleWriteBypass =
          Boolean((context as { allowPrivilegedRoleWrite?: boolean } | undefined)?.allowPrivilegedRoleWrite);
        const canWritePrivilegedRole = isAdminActor || hasPrivilegedRoleWriteBypass;

        // Public/self-service create must never be allowed to assign privileged roles.
        if (operation === 'create') {
          if (!canWritePrivilegedRole) {
            data.role = 'user';
            data.instructorId = null;
          } else if (!data.role) {
            data.role = 'user';
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

        return data;
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
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
  ],
};
