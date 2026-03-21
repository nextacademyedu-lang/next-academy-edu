import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Popups: CollectionConfig = {
  slug: 'popups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'popupType', 'startDate', 'endDate'],
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
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },

    // ── Content ────────────────────────────────────────────
    {
      type: 'group',
      name: 'content',
      label: 'Content',
      fields: [
        { name: 'titleAr', type: 'text' },
        { name: 'titleEn', type: 'text' },
        { name: 'badgeAr', type: 'text' },
        { name: 'badgeEn', type: 'text' },
        { name: 'subtitleAr', type: 'text' },
        { name: 'subtitleEn', type: 'text' },
        { name: 'descriptionAr', type: 'richText' },
        { name: 'descriptionEn', type: 'richText' },
        { name: 'legalNoteAr', type: 'text' },
        { name: 'legalNoteEn', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'imagePosition',
          type: 'select',
          defaultValue: 'top',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' },
            { label: 'Top', value: 'top' },
            { label: 'None', value: 'none' },
          ],
        },
      ],
    },

    // ── CTA ────────────────────────────────────────────────
    {
      type: 'group',
      name: 'cta',
      label: 'Call to Action',
      fields: [
        { name: 'primaryCtaText', type: 'text' },
        { name: 'primaryCtaLink', type: 'text' },
        { name: 'secondaryCtaText', type: 'text' },
        { name: 'secondaryCtaLink', type: 'text' },
      ],
    },

    // ── Promo Code ─────────────────────────────────────────
    {
      type: 'group',
      name: 'promo',
      label: 'Promo Code',
      fields: [
        { name: 'hasPromoCode', type: 'checkbox', defaultValue: false },
        {
          name: 'promoCode',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.hasPromoCode,
          },
        },
        {
          name: 'promoDelivery',
          type: 'select',
          defaultValue: 'show_directly',
          options: [
            { label: 'Show Directly', value: 'show_directly' },
            { label: 'After Form Submit', value: 'after_form' },
            { label: 'Send via Email', value: 'send_email' },
          ],
          admin: {
            condition: (_data, siblingData) => siblingData?.hasPromoCode,
          },
        },
      ],
    },

    // ── Form ───────────────────────────────────────────────
    {
      type: 'group',
      name: 'form',
      label: 'Lead Capture Form',
      fields: [
        { name: 'hasForm', type: 'checkbox', defaultValue: false },
        {
          name: 'formFields',
          type: 'array',
          admin: {
            condition: (_data, siblingData) => siblingData?.hasForm,
          },
          fields: [
            { name: 'fieldLabel', type: 'text', required: true },
            {
              name: 'fieldType',
              type: 'select',
              required: true,
              options: [
                { label: 'Email', value: 'email' },
                { label: 'Text', value: 'text' },
                { label: 'Phone', value: 'phone' },
                { label: 'Name', value: 'name' },
              ],
            },
            { name: 'isRequired', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          name: 'successMessage',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.hasForm,
          },
        },
        {
          name: 'redirectUrl',
          type: 'text',
          admin: {
            condition: (_data, siblingData) => siblingData?.hasForm,
          },
        },
      ],
    },

    // ── Appearance ─────────────────────────────────────────
    {
      type: 'group',
      name: 'appearance',
      label: 'Appearance',
      fields: [
        {
          name: 'stylePreset',
          type: 'select',
          defaultValue: 'default',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Offer Dark (Promo)', value: 'offer_dark' },
          ],
        },
        {
          name: 'popupType',
          type: 'select',
          defaultValue: 'modal',
          options: [
            { label: 'Modal', value: 'modal' },
            { label: 'Slide In', value: 'slide_in' },
            { label: 'Bottom Bar', value: 'bottom_bar' },
            { label: 'Full Screen', value: 'full_screen' },
          ],
        },
        {
          name: 'animation',
          type: 'select',
          defaultValue: 'fade',
          options: [
            { label: 'Fade', value: 'fade' },
            { label: 'Slide Up', value: 'slide_up' },
            { label: 'Slide Side', value: 'slide_side' },
            { label: 'Zoom', value: 'zoom' },
          ],
        },
        {
          name: 'overlayDarkness',
          type: 'number',
          defaultValue: 50,
          min: 0,
          max: 100,
          admin: { description: 'Overlay opacity 0-100%' },
        },
        { name: 'closeOnOutsideClick', type: 'checkbox', defaultValue: true },
        { name: 'bgColor', type: 'text', defaultValue: '#1a1a2e' },
        { name: 'textColor', type: 'text', defaultValue: '#ffffff' },
        { name: 'accentColor', type: 'text', defaultValue: '#e94560' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
        {
          name: 'backgroundOverlayOpacity',
          type: 'number',
          defaultValue: 62,
          min: 0,
          max: 100,
          admin: { description: 'Background image dark overlay opacity 0-100%' },
        },
        { name: 'borderColor', type: 'text', defaultValue: 'rgba(255,255,255,0.16)' },
        { name: 'badgeBgColor', type: 'text', defaultValue: '#117fb2' },
        { name: 'badgeTextColor', type: 'text', defaultValue: '#ffffff' },
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

    // ── Targeting ──────────────────────────────────────────
    {
      type: 'group',
      name: 'targeting',
      label: 'Targeting & Triggers',
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
        {
          name: 'triggerType',
          type: 'select',
          defaultValue: 'on_load',
          options: [
            { label: 'On Page Load', value: 'on_load' },
            { label: 'After Delay', value: 'after_delay' },
            { label: 'On Exit Intent', value: 'on_exit' },
            { label: 'On Scroll', value: 'on_scroll' },
          ],
        },
        {
          name: 'triggerDelay',
          type: 'number',
          defaultValue: 3,
          admin: {
            description: 'Seconds',
            condition: (_data, siblingData) => siblingData?.triggerType === 'after_delay',
          },
        },
        {
          name: 'triggerScroll',
          type: 'number',
          defaultValue: 50,
          admin: {
            description: 'Scroll percentage',
            condition: (_data, siblingData) => siblingData?.triggerType === 'on_scroll',
          },
        },
        {
          name: 'frequency',
          type: 'select',
          defaultValue: 'once_session',
          options: [
            { label: 'Every Time', value: 'every_time' },
            { label: 'Once Per Session', value: 'once_session' },
            { label: 'Once Per Day', value: 'once_day' },
            { label: 'Once Ever', value: 'once_ever' },
          ],
        },
        {
          name: 'targetAudience',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'Everyone', value: 'all' },
            { label: 'Guests Only', value: 'guests_only' },
            { label: 'Logged In Users', value: 'logged_in' },
            { label: 'Specific Role', value: 'specific_role' },
          ],
        },
        {
          name: 'targetRole',
          type: 'select',
          options: [
            { label: 'Student', value: 'student' },
            { label: 'Instructor', value: 'instructor' },
            { label: 'B2B Manager', value: 'b2b_manager' },
          ],
          admin: {
            condition: (_data, siblingData) => siblingData?.targetAudience === 'specific_role',
          },
        },
        {
          name: 'targetDevice',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'All Devices', value: 'all' },
            { label: 'Mobile Only', value: 'mobile' },
            { label: 'Desktop Only', value: 'desktop' },
          ],
        },
        {
          name: 'visitorCondition',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'All Visitors', value: 'all' },
            { label: 'First Visit Only', value: 'first_visit' },
            { label: 'Returning Visitors Only', value: 'returning_visitor' },
          ],
          admin: {
            description: 'Target first-time visitors or only returning visitors.',
          },
        },
        {
          name: 'purchaseCondition',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'All Users', value: 'all' },
            { label: 'No Purchase Yet', value: 'no_purchase' },
            { label: 'Has Purchased Before', value: 'has_purchase' },
          ],
          admin: {
            description: 'Use this to target users who purchased or not yet purchased.',
          },
        },
        {
          name: 'emailCaptureCondition',
          type: 'select',
          defaultValue: 'all',
          options: [
            { label: 'Ignore Email Capture', value: 'all' },
            { label: 'Email Captured', value: 'email_captured' },
            { label: 'Email Not Captured', value: 'email_not_captured' },
          ],
          admin: {
            description: 'Email capture is tracked client-side when popup forms are submitted.',
          },
        },
        {
          name: 'minSessionPageViews',
          type: 'number',
          min: 1,
          admin: {
            description: 'Minimum pages viewed in the current session before this popup can appear.',
          },
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

    // ── Analytics (read-only) ──────────────────────────────
    {
      name: 'viewCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'clickCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'conversionCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true, position: 'sidebar' },
    },
  ],
};
