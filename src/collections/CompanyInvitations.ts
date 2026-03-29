import type { CollectionConfig } from 'payload';
import { isAdmin } from '../lib/access-control.ts';

export const CompanyInvitations: CollectionConfig = {
  slug: 'company-invitations',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'company', 'status', 'invitedBy', 'expiresAt', 'acceptedAt'],
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'email', type: 'email', required: true },
    { name: 'company', type: 'relationship', relationTo: 'companies', required: true },
    { name: 'invitedBy', type: 'relationship', relationTo: 'users', required: true },
    { name: 'jobTitle', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'token', type: 'text', required: true, unique: true },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'accepted', 'revoked', 'expired'],
      defaultValue: 'pending',
      required: true,
    },
    { name: 'expiresAt', type: 'date', required: true },
    { name: 'acceptedAt', type: 'date' },
    { name: 'acceptedBy', type: 'relationship', relationTo: 'users' },
    { name: 'revokedAt', type: 'date' },
  ],
};
