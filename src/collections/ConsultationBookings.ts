import type { CollectionConfig } from 'payload';
import {
  isAdmin,
  isAdminOrOwnerOrOwnInstructor,
  isAdminOrOwnInstructorForUpdate,
  isAuthenticated,
} from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';

export const ConsultationBookings: CollectionConfig = {
  slug: 'consultation-bookings',
  admin: { useAsTitle: 'bookingCode' },
  access: {
    read: isAdminOrOwnerOrOwnInstructor,
    create: isAuthenticated,
    update: isAdminOrOwnInstructorForUpdate,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        try {
          let action = operation === 'create'
            ? 'consultation_booking_created'
            : 'consultation_booking_updated';

          if (operation === 'update') {
            if (previousDoc?.paymentStatus !== doc.paymentStatus) {
              if (doc.paymentStatus === 'paid') action = 'consultation_payment_paid';
              else if (doc.paymentStatus === 'refunded') action = 'consultation_payment_refunded';
              else action = 'consultation_payment_status_updated';
            } else if (previousDoc?.status !== doc.status) {
              action = 'consultation_status_updated';
            }
          }

          const fingerprint = [
            doc.updatedAt || doc.createdAt || '',
            doc.status || '',
            doc.paymentStatus || '',
            doc.amount ?? '',
          ].join('|');

          await enqueueCrmSyncEvent({
            payload: req.payload,
            req,
            entityType: 'consultation_booking',
            entityId: String(doc.id),
            action,
            dedupeKey: createCrmDedupeKey({
              entityType: 'consultation_booking',
              entityId: String(doc.id),
              action,
              fingerprint,
            }),
            priority: 32,
            sourceCollection: 'consultation-bookings',
            payloadSnapshot: {
              id: doc.id,
              user: doc.user,
              instructor: doc.instructor,
              consultationType: doc.consultationType,
              slot: doc.slot,
              status: doc.status,
              paymentStatus: doc.paymentStatus,
              amount: doc.amount,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[ConsultationBookings] afterChange CRM sync failed (non-blocking):', err);
        }
      },
    ],
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
    { name: 'twentyCrmDealId', type: 'text', admin: { readOnly: true } },
  ],
};
