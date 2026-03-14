import type { CollectionConfig } from 'payload';
import { isAdmin, isAuthenticated, isPublic } from '../lib/access-control.ts';

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: { useAsTitle: 'title' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'sessionNumber', type: 'number', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'date', type: 'date', required: true },
    { name: 'startTime', type: 'text', required: true },
    { name: 'endTime', type: 'text', required: true },
    {
      name: 'locationType',
      type: 'select',
      options: ['online', 'in-person', 'hybrid'],
      defaultValue: 'online',
    },
    { name: 'locationName', type: 'text' },
    { name: 'locationAddress', type: 'text' },
    { name: 'meetingUrl', type: 'text' },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors' },
    { name: 'recordingUrl', type: 'text' },
    { name: 'materials', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'isCancelled', type: 'checkbox', defaultValue: false },
    { name: 'cancellationReason', type: 'textarea' },
    { name: 'attendeesCount', type: 'number', defaultValue: 0 },
  ],
};
