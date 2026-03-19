import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const AnnouncementBars: CollectionConfig = {
  slug: 'announcement-bars',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'position', 'startDate', 'endDate'],
    group: 'Marketing',
  },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
      ],
      admin: { position: 'sidebar' },
    },

    // ── Messages ───────────────────────────────────────────
    {
      name: 'messages',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'textAr', type: 'text', required: true },
        { name: 'textEn', type: 'text', required: true },
        { name: 'linkUrl', type: 'text' },
        { name: 'icon', type: 'text', admin: { description: 'Emoji or icon name' } },
      ],
    },

    // ── Appearance ─────────────────────────────────────────
    {
      type: 'group',
      name: 'appearance',
      label: 'Appearance',
      fields: [
        {
          name: 'position',
          type: 'select',
          defaultValue: 'top',
          options: [
            { label: 'Top', value: 'top' },
            { label: 'Bottom', value: 'bottom' },
          ],
        },
        { name: 'bgColor', type: 'text', defaultValue: '#e94560' },
        {
          name: 'bgGradient',
          type: 'text',
          admin: { description: 'Optional CSS gradient (overrides bgColor)' },
        },
        { name: 'textColor', type: 'text', defaultValue: '#ffffff' },
        {
          name: 'fontSize',
          type: 'select',
          defaultValue: 'md',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
        },
      ],
    },

    // ── Animation ──────────────────────────────────────────
    {
      type: 'group',
      name: 'animation',
      label: 'Animation',
      fields: [
        { name: 'isAnimated', type: 'checkbox', defaultValue: true },
        {
          name: 'animationSpeed',
          type: 'select',
          defaultValue: 'normal',
          options: [
            { label: 'Slow', value: 'slow' },
            { label: 'Normal', value: 'normal' },
            { label: 'Fast', value: 'fast' },
          ],
          admin: {
            condition: (_data, siblingData) => siblingData?.isAnimated,
          },
        },
        {
          name: 'animationDirection',
          type: 'select',
          defaultValue: 'rtl',
          options: [
            { label: 'Left to Right', value: 'ltr' },
            { label: 'Right to Left', value: 'rtl' },
          ],
          admin: {
            condition: (_data, siblingData) => siblingData?.isAnimated,
          },
        },
      ],
    },

    // ── CTA ────────────────────────────────────────────────
    {
      type: 'group',
      name: 'ctaButton',
      label: 'CTA Button',
      fields: [
        { name: 'hasCtaButton', type: 'checkbox', defaultValue: false },
        {
          name: 'ctaText',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.hasCtaButton,
          },
        },
        {
          name: 'ctaLink',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.hasCtaButton,
          },
        },
      ],
    },

    // ── Countdown ──────────────────────────────────────────
    {
      type: 'group',
      name: 'countdown',
      label: 'Countdown Timer',
      fields: [
        { name: 'hasCountdown', type: 'checkbox', defaultValue: false },
        {
          name: 'countdownTarget',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            condition: (_data, siblingData) => siblingData?.hasCountdown,
          },
        },
      ],
    },

    // ── Behavior ───────────────────────────────────────────
    {
      type: 'group',
      name: 'behavior',
      label: 'Behavior',
      fields: [
        { name: 'isDismissible', type: 'checkbox', defaultValue: true },
        {
          name: 'rememberDismiss',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Remember dismiss via localStorage',
            condition: (_data, siblingData) => siblingData?.isDismissible,
          },
        },
      ],
    },

    // ── Targeting ──────────────────────────────────────────
    {
      type: 'group',
      name: 'targeting',
      label: 'Targeting',
      fields: [
        {
          name: 'displayPages',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'All Pages', value: 'all' },
            { label: 'Specific Pages', value: 'specific' },
          ],
        },
        {
          name: 'specificPages',
          type: 'array',
          admin: {
            condition: (_data, siblingData) => siblingData?.displayPages === 'specific',
          },
          fields: [{ name: 'url', type: 'text', required: true }],
        },
      ],
    },

    // ── Scheduling ─────────────────────────────────────────
    {
      name: 'startDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'priority',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Higher = shows first',
      },
    },
  ],
};
