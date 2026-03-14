import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwnerByField, isAuthenticated } from '../lib/access-control.ts';

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: { useAsTitle: 'paymentCode' },
  access: {
    read: isAdminOrOwnerByField('booking.user'),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'paymentCode', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'booking', type: 'relationship', relationTo: 'bookings', required: true },
    { name: 'installmentNumber', type: 'number' },
    { name: 'amount', type: 'number', required: true },
    { name: 'dueDate', type: 'date', required: true },
    { name: 'paidDate', type: 'date' },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'paid', 'overdue', 'failed', 'refunded'],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: ['paymob', 'fawry', 'cash', 'bank_transfer', 'voucher'],
    },
    { name: 'transactionId', type: 'text' },
    { name: 'paymobOrderId', type: 'text' },
    { name: 'paymentGatewayResponse', type: 'json' },
    { name: 'receiptUrl', type: 'text' },
    { name: 'receiptNumber', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'reminderSentCount', type: 'number', defaultValue: 0 },
    { name: 'lastReminderSent', type: 'date' },
  ],
};
