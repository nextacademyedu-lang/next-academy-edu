import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwnerByField, isAuthenticated } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: { useAsTitle: 'paymentCode' },
  access: {
    read: isAdminOrOwnerByField('booking.user'),
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        try {
          let action = operation === 'create' ? 'payment_created' : 'payment_updated';
          if (operation === 'update' && previousDoc?.status !== doc.status) {
            switch (doc.status) {
              case 'paid':
                action = 'payment_paid';
                break;
              case 'failed':
                action = 'payment_failed';
                break;
              case 'overdue':
                action = 'payment_overdue';
                break;
              case 'refunded':
                action = 'payment_refunded';
                break;
              default:
                action = 'payment_status_updated';
            }
          }

          const fingerprint = [
            doc.updatedAt || doc.createdAt || '',
            doc.status || '',
            doc.amount ?? '',
            doc.transactionId || '',
          ].join('|');

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'payment',
            entityId: String(doc.id),
            action,
            dedupeKey: createCrmDedupeKey({
              entityType: 'payment',
              entityId: String(doc.id),
              action,
              fingerprint,
            }),
            priority: 35,
            sourceCollection: 'payments',
            payloadSnapshot: {
              id: doc.id,
              booking: doc.booking,
              status: doc.status,
              amount: doc.amount,
              dueDate: doc.dueDate,
              paidDate: doc.paidDate,
              paymentMethod: doc.paymentMethod,
              transactionId: doc.transactionId,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[Payments] afterChange CRM sync failed (non-blocking):', err);
        }
      },
    ],
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
