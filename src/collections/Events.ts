import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Events: CollectionConfig = {
  slug: 'events',
  admin: { useAsTitle: 'titleAr' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Clean up bookings for this event
        const bookings = await req.payload.find({
          collection: 'bookings',
          where: { event: { equals: id } },
          depth: 0,
          limit: 500,
          overrideAccess: true,
          req,
        });
        for (const booking of bookings.docs) {
          await req.payload.delete({
            collection: 'bookings',
            id: (booking as { id: number | string }).id,
            overrideAccess: true,
            req,
          });
        }
      },
    ],
  },
  fields: [
    /* ── Type ─────────────────────────────────────────────────── */
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Event', value: 'event' },
        { label: 'Retreat', value: 'retreat' },
        { label: 'Corporate Training', value: 'corporate_training' },
      ],
      required: true,
      defaultValue: 'event',
    },

    /* ── Core Info ────────────────────────────────────────────── */
    { name: 'titleAr', type: 'text', required: true },
    { name: 'titleEn', type: 'text' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'descriptionAr', type: 'richText' },
    { name: 'descriptionEn', type: 'richText' },
    { name: 'shortDescriptionAr', type: 'textarea' },
    { name: 'shortDescriptionEn', type: 'textarea' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },

    /* ── Event Schedule ──────────────────────────────────────── */
    { name: 'eventDate', type: 'date', required: true, admin: { description: 'Start date/time' } },
    { name: 'eventEndDate', type: 'date', admin: { description: 'End date/time (optional)' } },
    { name: 'durationHours', type: 'number' },
    { name: 'registrationDeadline', type: 'date' },

    /* ── Location ────────────────────────────────────────────── */
    {
      name: 'locationType',
      type: 'select',
      options: [
        { label: 'Online', value: 'online' },
        { label: 'In Person', value: 'in_person' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
      defaultValue: 'in_person',
    },
    { name: 'venue', type: 'text', admin: { description: 'Venue / Location name' } },
    { name: 'venueAddress', type: 'textarea', admin: { description: 'Full address' } },
    { name: 'onlineLink', type: 'text', admin: { description: 'Zoom / Meet / etc. link' } },

    /* ── Registration & Pricing ──────────────────────────────── */
    { name: 'maxCapacity', type: 'number', admin: { description: 'Maximum attendees (0 = unlimited)' } },
    { name: 'price', type: 'number', defaultValue: 0, admin: { description: '0 = Free event' } },
    {
      name: 'currency',
      type: 'select',
      options: ['EGP', 'USD', 'EUR', 'SAR'],
      defaultValue: 'EGP',
    },
    {
      name: 'language',
      type: 'select',
      options: ['ar', 'en', 'both'],
      defaultValue: 'ar',
    },

    /* ── Custom Registration Fields ──────────────────────────── */
    {
      name: 'customRegistrationFields',
      type: 'array',
      admin: {
        description: 'Add custom fields to the registration form. Standard fields (name, email, phone) are always included.',
      },
      fields: [
        { name: 'fieldLabel', type: 'text', required: true },
        {
          name: 'fieldType',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Select', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
          ],
          defaultValue: 'text',
        },
        {
          name: 'selectOptions',
          type: 'text',
          admin: {
            description: 'Comma-separated options (for Select type only)',
            condition: (data, siblingData) => siblingData?.fieldType === 'select',
          },
        },
        { name: 'isRequired', type: 'checkbox', defaultValue: false },
      ],
    },

    /* ── Speakers / Hosts ────────────────────────────────────── */
    {
      name: 'speakers',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'title', type: 'text' },
        { name: 'bio', type: 'textarea' },
        { name: 'photo', type: 'upload', relationTo: 'media' },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Speaker', value: 'speaker' },
            { label: 'Host', value: 'host' },
            { label: 'Panelist', value: 'panelist' },
            { label: 'Moderator', value: 'moderator' },
          ],
          defaultValue: 'speaker',
        },
      ],
    },

    /* ── Sponsors / Partners ─────────────────────────────────── */
    {
      name: 'sponsors',
      type: 'relationship',
      relationTo: 'partners',
      hasMany: true,
    },

    /* ── Agenda (event type) ─────────────────────────────────── */
    {
      name: 'agenda',
      type: 'array',
      admin: {
        condition: (data) => (data?.type as string) !== 'retreat',
      },
      fields: [
        { name: 'time', type: 'text', required: true },
        { name: 'titleAr', type: 'text', required: true },
        { name: 'titleEn', type: 'text' },
        { name: 'descriptionAr', type: 'textarea' },
        { name: 'speaker', type: 'text' },
      ],
    },

    /* ── Itinerary (retreat type) ─────────────────────────────── */
    {
      name: 'itinerary',
      type: 'array',
      admin: {
        description: 'Day-by-day itinerary for retreats.',
        condition: (data) => (data?.type as string) === 'retreat',
      },
      fields: [
        { name: 'dayNumber', type: 'number', required: true },
        { name: 'titleAr', type: 'text', required: true },
        { name: 'titleEn', type: 'text' },
        {
          name: 'activities',
          type: 'array',
          fields: [
            { name: 'time', type: 'text' },
            { name: 'activityAr', type: 'text', required: true },
            { name: 'activityEn', type: 'text' },
          ],
        },
      ],
    },

    /* ── Includes / Excludes (retreat, corporate) ─────────────── */
    {
      name: 'eventIncludes',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: {
        description: "What's included (accommodation, meals, etc.)",
        condition: (data) =>
          ['retreat', 'corporate_training'].includes(data?.type as string),
      },
    },
    {
      name: 'eventExcludes',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: {
        description: "What's NOT included.",
        condition: (data) =>
          ['retreat', 'corporate_training'].includes(data?.type as string),
      },
    },

    /* ── Target Audience ─────────────────────────────────────── */
    { name: 'targetAudience', type: 'array', fields: [{ name: 'item', type: 'text' }] },

    /* ── Display / Featured ──────────────────────────────────── */
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    {
      name: 'featuredPriority',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower = appears first' },
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },

    /* ── Stats (read-only) ───────────────────────────────────── */
    { name: 'attendeesCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'viewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },

    /* ── SEO ──────────────────────────────────────────────────── */
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
    { name: 'seoKeywords', type: 'array', fields: [{ name: 'keyword', type: 'text' }] },
  ],
};
