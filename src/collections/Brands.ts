import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Brands: CollectionConfig = {
  slug: 'brands',
  admin: {
    useAsTitle: 'name',
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
      name: 'name', 
      type: 'text', 
      required: true,
      admin: { description: 'The brand or identity name (e.g., BLS, AHA, etc.)' }
    },
    { 
      name: 'slug', 
      type: 'text', 
      required: true, 
      unique: true,
      admin: { description: 'URL friendly string, e.g. bls' }
    },
    { 
      name: 'logo', 
      type: 'upload', 
      relationTo: 'media', 
      required: true,
      admin: { description: 'The brand logo' }
    },
    {
      name: 'themeColor',
      type: 'text',
      defaultValue: '#3b82f6',
      admin: { description: 'Hex code for the primary brand color (e.g. #FF0000)' }
    },
    {
      name: 'textColor',
      type: 'text',
      defaultValue: '#ffffff',
      admin: { description: 'Hex code for the text color displayed on top of the primary color (e.g. #FFFFFF)' }
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    }
  ],
};
