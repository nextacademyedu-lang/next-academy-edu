import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const UpcomingEventsConfig: CollectionConfig = {
  slug: 'upcoming-events-config',
  admin: {
    useAsTitle: 'sectionTitleEn',
    group: 'Marketing',
  },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'isEnabled', type: 'checkbox', defaultValue: true },

    // ── Section Titles ─────────────────────────────────────
    {
      name: 'sectionTitleAr',
      type: 'text',
      defaultValue: 'الفعاليات القادمة',
    },
    {
      name: 'sectionTitleEn',
      type: 'text',
      defaultValue: 'Upcoming Events',
    },

    // ── Mode & Filtering ───────────────────────────────────
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'automatic',
      options: [
        { label: 'Automatic (from Rounds)', value: 'automatic' },
        { label: 'Manual Selection', value: 'manual' },
      ],
    },
    {
      name: 'filterType',
      type: 'select',
      defaultValue: 'all',
      options: [
        { label: 'All Types', value: 'all' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Course', value: 'course' },
        { label: 'Webinar', value: 'webinar' },
        { label: 'Event', value: 'event' },
        { label: 'Camp', value: 'camp' },
        { label: 'Retreat', value: 'retreat' },
        { label: 'Corporate Training', value: 'corporate_training' },
      ],
      admin: {
        condition: (data) => data?.mode === 'automatic',
      },
    },
    {
      name: 'maxItems',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 20,
    },
    {
      name: 'sortOrder',
      type: 'select',
      defaultValue: 'date_asc',
      options: [
        { label: 'Date (Soonest First)', value: 'date_asc' },
        { label: 'Manual Order', value: 'manual' },
      ],
    },

    // ── Carousel Settings ──────────────────────────────────
    {
      name: 'autoPlaySpeed',
      type: 'number',
      defaultValue: 5000,
      admin: { description: 'Auto-play interval in ms (0 = disabled)' },
    },

    // ── Card Display Options ───────────────────────────────
    {
      type: 'group',
      name: 'cardDisplay',
      label: 'Card Display Options',
      fields: [
        { name: 'showPrice', type: 'checkbox', defaultValue: true },
        { name: 'showDate', type: 'checkbox', defaultValue: true },
        { name: 'showInstructor', type: 'checkbox', defaultValue: true },
        { name: 'showLocation', type: 'checkbox', defaultValue: false },
      ],
    },

    // ── Links ──────────────────────────────────────────────
    {
      name: 'viewAllLink',
      type: 'text',
      defaultValue: '/programs',
      admin: { description: 'URL for "View All" button' },
    },

    // ── Empty State ────────────────────────────────────────
    {
      name: 'emptyMessageAr',
      type: 'text',
      defaultValue: 'لا توجد فعاليات قادمة حالياً',
    },
    {
      name: 'emptyMessageEn',
      type: 'text',
      defaultValue: 'No upcoming events at this time',
    },

    // ── Manual Items ───────────────────────────────────────
    {
      name: 'manualItems',
      type: 'array',
      admin: {
        condition: (data) => data?.mode === 'manual',
      },
      fields: [
        {
          name: 'program',
          type: 'relationship',
          relationTo: 'programs',
          required: true,
        },
        {
          name: 'round',
          type: 'relationship',
          relationTo: 'rounds',
        },
        {
          name: 'customImage',
          type: 'upload',
          relationTo: 'media',
        },
        { name: 'customUrl', type: 'text' },
        {
          name: 'sortOrder',
          type: 'number',
          defaultValue: 0,
          admin: { description: 'Lower = shows first' },
        },
      ],
    },
  ],
};
