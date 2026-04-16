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
    {
      type: 'tabs',
      tabs: [
        /* ── Tab 1: General ─────────────────────────────────────── */
        {
          label: 'General',
          fields: [
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
            { name: 'titleAr', type: 'text', required: true },
            { name: 'titleEn', type: 'text' },
            { name: 'slug', type: 'text', required: true, unique: true },
            { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { description: 'Controls whether this event is publicly visible' } },
            { name: 'category', type: 'relationship', relationTo: 'categories' },
          ],
        },

        /* ── Tab 2: Content ─────────────────────────────────────── */
        {
          label: 'Content',
          fields: [
            { name: 'shortDescriptionAr', type: 'textarea' },
            { name: 'shortDescriptionEn', type: 'textarea' },
            { name: 'descriptionAr', type: 'richText' },
            { name: 'descriptionEn', type: 'richText' },
            { name: 'thumbnail', type: 'upload', relationTo: 'media', admin: { description: 'Small preview image used in cards and listings' } },
            { name: 'coverImage', type: 'upload', relationTo: 'media', admin: { description: 'Large banner image displayed on the event detail page' } },
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
            {
              name: 'sponsors',
              type: 'relationship',
              relationTo: 'partners',
              hasMany: true,
              admin: { description: 'Select partner organizations sponsoring this event' },
            },
          ],
        },

        /* ── Tab 3: Schedule ────────────────────────────────────── */
        {
          label: 'Schedule',
          fields: [
            { name: 'eventDate', type: 'date', required: true, admin: { description: 'Start date/time' } },
            { name: 'eventEndDate', type: 'date', admin: { description: 'End date/time (optional)' } },
            { name: 'durationHours', type: 'number', admin: { description: 'Total event duration in hours' } },
            { name: 'registrationDeadline', type: 'date', admin: { description: 'Last date to register for this event' } },
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
            {
              name: 'agenda',
              type: 'array',
              admin: {
                description: 'Session-by-session agenda (not used for retreats)',
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
          ],
        },

        /* ── Tab 4: Pricing ─────────────────────────────────────── */
        {
          label: 'Pricing',
          fields: [
            { name: 'price', type: 'number', defaultValue: 0, admin: { description: '0 = Free event' } },
            {
              name: 'currency',
              type: 'select',
              options: ['EGP', 'USD', 'EUR', 'SAR'],
              defaultValue: 'EGP',
            },
            { name: 'maxCapacity', type: 'number', admin: { description: 'Maximum attendees (0 = unlimited)' } },
            {
              name: 'language',
              type: 'select',
              options: ['ar', 'en', 'both'],
              defaultValue: 'ar',
              admin: { description: 'Language the event is delivered in' },
            },
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
          ],
        },

        /* ── Tab 5: SEO ─────────────────────────────────────────── */
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text' },
            { name: 'seoDescription', type: 'textarea' },
            { name: 'seoKeywords', type: 'array', fields: [{ name: 'keyword', type: 'text' }] },
          ],
        },

        /* ── Tab 6: Settings ────────────────────────────────────── */
        {
          label: 'Settings',
          fields: [
            { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
            { name: 'targetAudience', type: 'array', fields: [{ name: 'item', type: 'text' }], admin: { description: 'Who this event is designed for' } },
            { name: 'isFeatured', type: 'checkbox', defaultValue: false },
            {
              name: 'featuredPriority',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Lower = appears first' },
            },
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
            /* ── Stats (read-only) ───────────────────────────────── */
            { name: 'attendeesCount', type: 'number', defaultValue: 0, admin: { readOnly: true, description: 'Auto-calculated from bookings' } },
            { name: 'viewCount', type: 'number', defaultValue: 0, admin: { readOnly: true, description: 'Auto-tracked page views' } },
          ],
        },
      ],
    },
  ],
};
