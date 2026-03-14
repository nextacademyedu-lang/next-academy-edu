import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

export const Rounds: CollectionConfig = {
  slug: 'rounds',
  admin: { useAsTitle: 'title' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true },
    { name: 'roundNumber', type: 'number', required: true },
    { name: 'title', type: 'text' },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date' },
    { name: 'timezone', type: 'text', defaultValue: 'Africa/Cairo' },
    {
      name: 'locationType',
      type: 'select',
      options: ['online', 'in-person', 'hybrid'],
      defaultValue: 'online',
    },
    { name: 'locationName', type: 'text' },
    { name: 'locationAddress', type: 'text' },
    { name: 'locationMapUrl', type: 'text' },
    { name: 'meetingUrl', type: 'text' },
    { name: 'maxCapacity', type: 'number', required: true },
    { name: 'currentEnrollments', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'price', type: 'number', required: true },
    { name: 'earlyBirdPrice', type: 'number' },
    { name: 'earlyBirdDeadline', type: 'date' },
    {
      name: 'currency',
      type: 'select',
      options: ['EGP', 'USD', 'EUR'],
      defaultValue: 'EGP',
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'upcoming', 'open', 'full', 'in_progress', 'cancelled', 'completed'],
      defaultValue: 'draft',
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'autoCloseOnFull', type: 'checkbox', defaultValue: true },
    { name: 'reminderSent', type: 'checkbox', defaultValue: false },
    { name: 'notes', type: 'textarea' },
  ],
};
