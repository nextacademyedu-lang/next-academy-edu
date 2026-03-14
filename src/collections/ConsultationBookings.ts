import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwner, isAuthenticated } from '../lib/access-control.ts';

export const ConsultationBookings: CollectionConfig = {
  slug: 'consultation-bookings',
  admin: { useAsTitle: 'bookingCode' },
  access: {
    read: isAdminOrOwner,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'bookingCode', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'slot', type: 'relationship', relationTo: 'consultation-slots', required: true },
    { name: 'consultationType', type: 'relationship', relationTo: 'consultation-types', required: true },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'],
      defaultValue: 'pending',
      required: true,
    },
    { name: 'amount', type: 'number', required: true },
    {
      name: 'paymentStatus',
      type: 'select',
      options: ['pending', 'paid', 'refunded'],
      defaultValue: 'pending',
    },
    { name: 'transactionId', type: 'text' },
    { name: 'meetingUrl', type: 'text' },
    { name: 'userNotes', type: 'textarea' },
    { name: 'instructorNotes', type: 'textarea' },
    {
      name: 'cancelledBy',
      type: 'select',
      options: ['user', 'instructor', 'admin'],
    },
    { name: 'cancellationReason', type: 'textarea' },
    { name: 'reminderSent', type: 'checkbox', defaultValue: false },
    { name: 'discountCode', type: 'text' },
    { name: 'discountAmount', type: 'number', defaultValue: 0 },
  ],
};
