import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Instructors: CollectionConfig = {
  slug: 'instructors',
  admin: { useAsTitle: 'firstName' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
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
    { name: 'linkedinUrl', type: 'text' },
    { name: 'twitterUrl', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'featuredOrder', type: 'number' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
