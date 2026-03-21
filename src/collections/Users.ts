import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrSelf } from '../lib/access-control.ts';
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
    admin: ({ req: { user } }) => Boolean(user && user.role === 'admin'),
  },
  hooks: {
    beforeChange: [
      ({ req, data, originalDoc, operation }) => {
        // Allow onInit seed and server-side operations (no user = internal API)
        if (!req.user) return data;

        // If role is being changed and user is not admin, revert it
        if (operation === 'update' && data.role && originalDoc && data.role !== originalDoc.role) {
          if (req.user.role !== 'admin') {
            data.role = originalDoc.role; // silently revert
          }
        }

        // On create, non-admins always get 'user' role
        if (operation === 'create' && req.user.role !== 'admin') {
          data.role = 'user';
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
