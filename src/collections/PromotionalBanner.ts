import type { GlobalConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control';

export const PromotionalBanner: GlobalConfig = {
  slug: 'promotional-banner',
  label: {
    en: 'Promotional Banner',
    ar: 'البانر الإعلاني',
  },
  admin: {
    group: 'Marketing',
  },
  access: {
    read: isPublic,
    update: isAdmin,
  },
  fields: [
    { 
      name: 'isActive', 
      type: 'checkbox', 
      defaultValue: false, 
      label: 'Show Banner on Home Page' 
    },
    {
      type: 'row',
      fields: [
        { name: 'titleAr', type: 'text', required: true, defaultValue: 'عنوان البانر' },
        { name: 'titleEn', type: 'text', defaultValue: 'Banner Title' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtitleAr', type: 'textarea' },
        { name: 'subtitleEn', type: 'textarea' },
      ],
    },
    { 
      name: 'image', 
      type: 'upload', 
      relationTo: 'media',
      admin: {
        description: 'Recommended size: 1200x400 or similar wide ratio.',
      }
    },
    {
      type: 'row',
      fields: [
        { name: 'buttonTextAr', type: 'text', defaultValue: 'اعرف المزيد' },
        { name: 'buttonTextEn', type: 'text', defaultValue: 'Learn More' },
      ],
    },
    { 
      name: 'buttonLink', 
      type: 'text', 
      admin: { 
        description: 'e.g. /events/my-event or https://example.com' 
      } 
    },
    { 
      name: 'backgroundColor', 
      type: 'text', 
      defaultValue: '#1a2e4a', 
      admin: { 
        description: 'Background color (e.g. #1a2e4a or rgb(26, 46, 74))' 
      } 
    },
  ],
};
