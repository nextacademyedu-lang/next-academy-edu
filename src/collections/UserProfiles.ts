import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwnerByField, isAuthenticated, isPublic } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const UserProfiles: CollectionConfig = {
  slug: 'user-profiles',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAdminOrOwnerByField('user'),
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        try {
          const userId =
            typeof doc.user === 'object' && doc.user
              ? doc.user.id
              : doc.user;
          if (!userId) return;

          const onboardingCompleted =
            Boolean(doc.onboardingCompleted) &&
            !Boolean(previousDoc?.onboardingCompleted);

          const action = onboardingCompleted
            ? 'onboarding_completed'
            : operation === 'create'
              ? 'user_profile_created'
              : 'user_profile_updated';

          const profileFingerprint = [
            doc.updatedAt || doc.createdAt || '',
            doc.onboardingCompleted ? 'completed' : 'incomplete',
            doc.company || '',
          ].join('|');

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'user_profile',
            entityId: String(doc.id),
            action,
            dedupeKey: createCrmDedupeKey({
              entityType: 'user_profile',
              entityId: String(doc.id),
              action,
              fingerprint: profileFingerprint,
            }),
            priority: 15,
            sourceCollection: 'user-profiles',
            payloadSnapshot: {
              id: doc.id,
              userId,
              company: doc.company,
              onboardingCompleted: doc.onboardingCompleted,
              updatedAt: doc.updatedAt,
            },
          });

          const userAction = onboardingCompleted
            ? 'user_onboarding_completed'
            : 'user_profile_updated';

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'user',
            entityId: String(userId),
            action: userAction,
            dedupeKey: createCrmDedupeKey({
              entityType: 'user',
              entityId: String(userId),
              action: userAction,
              fingerprint: profileFingerprint,
            }),
            priority: 12,
            sourceCollection: 'user-profiles',
            payloadSnapshot: {
              profileId: doc.id,
              userId,
              company: doc.company,
              onboardingCompleted: doc.onboardingCompleted,
            },
          });

          const companyId =
            typeof doc.company === 'object' && doc.company
              ? doc.company.id
              : doc.company;
          if (!companyId) return;

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'company',
            entityId: String(companyId),
            action: 'company_profile_link_updated',
            dedupeKey: createCrmDedupeKey({
              entityType: 'company',
              entityId: String(companyId),
              action: 'company_profile_link_updated',
              fingerprint: `${doc.updatedAt || doc.createdAt || ''}|${userId}`,
            }),
            priority: 11,
            sourceCollection: 'user-profiles',
            payloadSnapshot: {
              companyId,
              userId,
              profileId: doc.id,
            },
          });
        } catch (err) {
          console.error('[UserProfiles] afterChange CRM sync failed (non-blocking):', err);
        }
      },
    ],
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, unique: true },
    {
      name: 'title',
      type: 'select',
      options: ['Mr', 'Mrs', 'Dr', 'Eng', 'Prof'],
    },
    { name: 'jobTitle', type: 'text' },
    {
      name: 'workField',
      type: 'text',
    },
    {
      name: 'yearsOfExperience',
      type: 'select',
      options: ['0-2', '3-5', '6-10', '10+'],
    },
    {
      name: 'education',
      type: 'select',
      options: ['High School', 'Bachelor', 'Master', 'MBA', 'PhD', 'Other'],
    },
    { name: 'yearOfBirth', type: 'number' },
    { name: 'country', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'company', type: 'relationship', relationTo: 'companies' },
    {
      name: 'companySize',
      type: 'select',
      options: ['1-10', '11-50', '51-200', '201-500', '500+'],
    },
    {
      name: 'companyType',
      type: 'select',
      options: ['startup', 'sme', 'enterprise', 'government', 'freelancer'],
    },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'learningGoals', type: 'textarea' },
    { name: 'interests', type: 'relationship', relationTo: 'tags', hasMany: true },
    {
      name: 'howDidYouHear',
      type: 'text',
    },
    { name: 'onboardingCompleted', type: 'checkbox', defaultValue: false },
    { name: 'onboardingStep', type: 'number', defaultValue: 1 },
  ],
};
