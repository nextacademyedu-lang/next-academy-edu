import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthenticated, isPublic } from '../lib/access-control.ts';

export const UserProfiles: CollectionConfig = {
  slug: 'user-profiles',
  admin: { useAsTitle: 'id' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
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
      type: 'select',
      options: ['Marketing', 'Sales', 'Tech', 'Finance', 'Operations', 'HR', 'Legal', 'Other'],
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
      type: 'select',
      options: ['website', 'whatsapp', 'social', 'friend', 'google', 'other'],
    },
    { name: 'onboardingCompleted', type: 'checkbox', defaultValue: false },
    { name: 'onboardingStep', type: 'number', defaultValue: 1 },
  ],
};
