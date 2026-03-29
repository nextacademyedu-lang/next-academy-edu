import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'category', 'publishedAt'],
    group: 'Content',
  },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly identifier (e.g. "how-to-grow-your-business")',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Short summary shown on blog listing cards',
      },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Strategy', value: 'strategy' },
        { label: 'Leadership', value: 'leadership' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Technology', value: 'technology' },
        { label: 'Finance', value: 'finance' },
        { label: 'HR', value: 'hr' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
};
