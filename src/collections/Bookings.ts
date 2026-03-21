import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwner, isAuthenticated } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

function resolveBookingAction(params: {
  operation: 'create' | 'update';
  status: string;
  previousStatus?: string;
}): string {
  const { operation, status, previousStatus } = params;
  if (operation === 'create') return 'booking_created';
  if (previousStatus === status) return 'booking_updated';

  switch (status) {
    case 'confirmed':
      return 'booking_confirmed';
    case 'cancelled':
      return 'booking_cancelled';
    case 'refunded':
      return 'booking_refunded';
    case 'payment_failed':
      return 'booking_payment_failed';
    case 'cancelled_overdue':
      return 'booking_cancelled_overdue';
    case 'completed':
      return 'booking_completed';
    case 'reserved':
      return 'booking_reserved';
    default:
      return 'booking_status_updated';
  }
}

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  admin: { useAsTitle: 'bookingCode' },
  access: {
    read: isAdminOrOwner,
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        const action = resolveBookingAction({
          operation,
          status: String(doc.status || ''),
          previousStatus: previousDoc?.status ? String(previousDoc.status) : undefined,
        });

        const fingerprint = [
          doc.updatedAt || doc.createdAt || '',
          doc.status || '',
          doc.paidAmount ?? '',
          doc.remainingAmount ?? '',
          doc.finalAmount ?? '',
        ].join('|');

        await enqueueCrmSyncEvent({
          payload: req.payload,
          req,
          entityType: 'booking',
          entityId: String(doc.id),
          action,
          dedupeKey: createCrmDedupeKey({
            entityType: 'booking',
            entityId: String(doc.id),
            action,
            fingerprint,
          }),
          priority: 30,
          sourceCollection: 'bookings',
          payloadSnapshot: {
            id: doc.id,
            status: doc.status,
            user: doc.user,
            round: doc.round,
            totalAmount: doc.totalAmount,
            finalAmount: doc.finalAmount,
            paidAmount: doc.paidAmount,
            remainingAmount: doc.remainingAmount,
            bookingSource: doc.bookingSource,
            updatedAt: doc.updatedAt,
          },
        });
      },
    ],
  },
  fields: [
    { name: 'bookingCode', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'paymentPlan', type: 'relationship', relationTo: 'payment-plans' },
    { name: 'installmentRequest', type: 'relationship', relationTo: 'installment-requests' },
    {
      name: 'status',
      type: 'select',
      options: ['reserved', 'pending', 'confirmed', 'cancelled', 'completed', 'refunded', 'payment_failed', 'cancelled_overdue'],
      defaultValue: 'pending',
      required: true,
    },
    { name: 'totalAmount', type: 'number', required: true },
    { name: 'paidAmount', type: 'number', defaultValue: 0 },
    { name: 'remainingAmount', type: 'number', defaultValue: 0 },
    { name: 'discountCode', type: 'text' },
    { name: 'discountAmount', type: 'number', defaultValue: 0 },
    { name: 'finalAmount', type: 'number', required: true },
    { name: 'accessBlocked', type: 'checkbox', defaultValue: false },
    {
      name: 'bookingSource',
      type: 'select',
      options: ['website', 'whatsapp', 'admin', 'phone', 'payment_link'],
      defaultValue: 'website',
    },
    { name: 'bookedByAdmin', type: 'relationship', relationTo: 'users' },
    { name: 'notes', type: 'textarea' },
    { name: 'internalNotes', type: 'textarea' },
    { name: 'twentyCrmDealId', type: 'text', admin: { readOnly: true } },
    { name: 'confirmationEmailSent', type: 'checkbox', defaultValue: false },
    { name: 'reminderEmailSent', type: 'checkbox', defaultValue: false },
    { name: 'cancelledAt', type: 'date' },
    { name: 'cancellationReason', type: 'textarea' },
    { name: 'refundAmount', type: 'number' },
    { name: 'refundDate', type: 'date' },
  ],
};
