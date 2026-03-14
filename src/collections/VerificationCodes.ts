import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/access-control.ts';

export const VerificationCodes: CollectionConfig = {
  slug: 'verification-codes',
  admin: {
    useAsTitle: 'email',
    group: 'System',
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
    },
    {
      name: 'used',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Email Verification', value: 'email_verification' },
        { label: 'Password Reset', value: 'password_reset' },
      ],
      defaultValue: 'email_verification',
      required: true,
    },
  ],
};
