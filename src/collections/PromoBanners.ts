import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const PromoBanners: CollectionConfig = {
  slug: 'promo-banners',
  admin: {
    useAsTitle: 'name',
    group: 'Marketing',
    defaultColumns: ['name', 'isActive', 'page', 'position', 'group', 'sortOrder'],
  },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        /* ── Tab 1: General ────────────────────────────────────── */
        {
          label: 'General',
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { description: 'Internal name (for dashboard only)' },
            },
            { name: 'isActive', type: 'checkbox', defaultValue: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'page',
                  type: 'select',
                  required: true,
                  defaultValue: 'home',
                  options: [
                    { label: 'Home', value: 'home' },
                    { label: 'Events', value: 'events' },
                    { label: 'Programs', value: 'programs' },
                    { label: 'Courses', value: 'courses' },
                    { label: 'About', value: 'about' },
                    { label: 'All Pages', value: 'all' },
                  ],
                  admin: { description: 'Which page this banner appears on' },
                },
                {
                  name: 'position',
                  type: 'select',
                  required: true,
                  defaultValue: 'after_events',
                  options: [
                    { label: 'After Hero', value: 'after_hero' },
                    { label: 'After Featured', value: 'after_featured' },
                    { label: 'After Events', value: 'after_events' },
                    { label: 'After Testimonials', value: 'after_testimonials' },
                    { label: 'Before Footer', value: 'before_footer' },
                  ],
                  admin: { description: 'Where on the page it should appear' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'group',
                  type: 'text',
                  defaultValue: 'default',
                  admin: { description: 'Banners in the same group + page + position = slideshow. Use a unique name per slideshow.' },
                },
                {
                  name: 'sortOrder',
                  type: 'number',
                  defaultValue: 0,
                  admin: { description: 'Order within slideshow (lower = first)' },
                },
              ],
            },
          ],
        },

        /* ── Tab 2: Content ────────────────────────────────────── */
        {
          label: 'Content',
          fields: [
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
              admin: { description: 'Banner image (used based on layout choice)' },
            },
          ],
        },

        /* ── Tab 3: Buttons ────────────────────────────────────── */
        {
          label: 'Buttons',
          fields: [
            {
              name: 'buttons',
              type: 'array',
              maxRows: 4,
              admin: { description: 'Add up to 4 buttons per banner' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'labelAr', type: 'text', required: true, defaultValue: 'اعرف المزيد' },
                    { name: 'labelEn', type: 'text', defaultValue: 'Learn More' },
                  ],
                },
                { name: 'link', type: 'text', required: true, admin: { description: 'URL path or full link' } },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'variant',
                      type: 'select',
                      defaultValue: 'solid',
                      options: [
                        { label: 'Solid', value: 'solid' },
                        { label: 'Outline', value: 'outline' },
                        { label: 'Ghost', value: 'ghost' },
                      ],
                    },
                    {
                      name: 'color',
                      type: 'text',
                      defaultValue: '#dc2626',
                      admin: { description: 'Button color (hex)' },
                    },
                  ],
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },

        /* ── Tab 4: Style ──────────────────────────────────────── */
        {
          label: 'Style',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'layout',
                  type: 'select',
                  defaultValue: 'image_right',
                  options: [
                    { label: 'Image Right', value: 'image_right' },
                    { label: 'Image Left', value: 'image_left' },
                    { label: 'Image Background (Full)', value: 'image_bg' },
                    { label: 'Text Only', value: 'text_only' },
                  ],
                },
                {
                  name: 'height',
                  type: 'select',
                  defaultValue: 'auto',
                  options: [
                    { label: 'Auto', value: 'auto' },
                    { label: 'Small (200px)', value: 'sm' },
                    { label: 'Medium (320px)', value: 'md' },
                    { label: 'Large (420px)', value: 'lg' },
                    { label: 'Extra Large (520px)', value: 'xl' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'backgroundColor',
                  type: 'text',
                  defaultValue: '#1a2e4a',
                  admin: { description: 'Background color (hex)' },
                },
                {
                  name: 'backgroundGradient',
                  type: 'text',
                  admin: { description: 'Optional CSS gradient, e.g. linear-gradient(135deg, #1a2e4a 0%, #2d4a7c 100%)' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'textColor',
                  type: 'text',
                  defaultValue: '#ffffff',
                  admin: { description: 'Text color (hex)' },
                },
                {
                  name: 'textAlign',
                  type: 'select',
                  defaultValue: 'start',
                  options: [
                    { label: 'Start', value: 'start' },
                    { label: 'Center', value: 'center' },
                    { label: 'End', value: 'end' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'contentAlign',
                  type: 'select',
                  defaultValue: 'center',
                  options: [
                    { label: 'Top', value: 'start' },
                    { label: 'Center', value: 'center' },
                    { label: 'Bottom', value: 'end' },
                  ],
                  admin: { description: 'Vertical alignment of content' },
                },
                {
                  name: 'overlayOpacity',
                  type: 'number',
                  defaultValue: 60,
                  min: 0,
                  max: 100,
                  admin: { description: 'Overlay darkness on image_bg layout (0-100)' },
                },
              ],
            },
            {
              name: 'borderRadius',
              type: 'number',
              defaultValue: 24,
              admin: { description: 'Corner rounding in px (0 = sharp corners)' },
            },

            /* Slideshow settings */
            {
              type: 'row',
              fields: [
                {
                  name: 'autoPlaySpeed',
                  type: 'number',
                  defaultValue: 5000,
                  admin: { description: 'Slideshow auto-play speed (ms). 0 = manual only. Only used on the first banner in the group.' },
                },
                {
                  name: 'transition',
                  type: 'select',
                  defaultValue: 'fade',
                  options: [
                    { label: 'Fade', value: 'fade' },
                    { label: 'Slide', value: 'slide' },
                  ],
                  admin: { description: 'Slideshow transition (first banner in group)' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
