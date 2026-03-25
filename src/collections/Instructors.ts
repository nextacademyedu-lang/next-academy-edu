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
  hooks: {
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
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
