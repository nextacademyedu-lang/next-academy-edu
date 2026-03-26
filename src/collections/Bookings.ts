import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwner, isAuthenticated } from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';
import { isGoogleCalendarEnabled } from '../lib/google-auth.ts';
import { addAttendeeToAllEvents, removeAttendeeFromAllEvents } from '../lib/google-calendar.ts';

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
    beforeDelete: [
      async ({ req, id }) => {
        const deleteByBooking = async (collection: string) => {
          const found = await req.payload.find({
            collection: collection as any,
            where: { booking: { equals: id } },
            depth: 0,
            limit: 500,
            overrideAccess: true,
            req,
          });
          for (const doc of found.docs) {
            await req.payload.delete({
              collection: collection as any,
              id: (doc as { id: number | string }).id,
              overrideAccess: true,
              req,
            });
          }
        };
        await deleteByBooking('reviews');
        await deleteByBooking('payments');
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc, operation }) => {
        try {
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

          // Google Calendar: auto-invite on confirm, auto-revoke on cancel/refund
          if (isGoogleCalendarEnabled()) {
            const statusChanged = previousDoc?.status !== doc.status;
            const isConfirmed = doc.status === 'confirmed' && statusChanged;
            const isRevoked =
              (doc.status === 'cancelled' || doc.status === 'refunded' || doc.status === 'cancelled_overdue') &&
              statusChanged;

            if (isConfirmed || isRevoked) {
              try {
                // Get user email
                const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user;
                const userDoc = userId
                  ? await req.payload.findByID({
                      collection: 'users',
                      id: userId,
                      depth: 0,
                      overrideAccess: true,
                      req,
                    })
                  : null;
                const email = (userDoc as any)?.email;

                if (email) {
                  // Get sessions for this booking's round
                  const roundId = typeof doc.round === 'object' ? doc.round?.id : doc.round;
                  if (roundId) {
                    const sessionsResult = await req.payload.find({
                      collection: 'sessions',
                      where: { round: { equals: roundId } },
                      depth: 0,
                      limit: 500,
                      overrideAccess: true,
                      req,
                    });

                    const eventIds = (sessionsResult.docs as any[])
                      .map((s) => s.googleEventId)
                      .filter(Boolean);

                    if (eventIds.length > 0) {
                      if (isConfirmed) {
                        await addAttendeeToAllEvents(eventIds, email);
                      } else {
                        await removeAttendeeFromAllEvents(eventIds, email);
                      }
                    }
                  }
                }
              } catch (err) {
                console.error('[Bookings] Google Calendar invite/revoke error:', err);
              }
            }
          }
        } catch (err) {
          console.error('[Bookings] afterChange hook failed (non-blocking):', err);
        }
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
