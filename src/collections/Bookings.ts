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
  admin: {
    useAsTitle: 'bookingCode',
    defaultColumns: ['bookingCode', 'status', 'totalAmount', 'finalAmount', 'bookingSource', 'bookingType', 'createdAt'],
  },
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
    beforeChange: [
      // B2B Policy enforcement: check if user's company allows this booking
      async ({ req, data, operation }) => {
        if (operation !== 'create') return data;

        try {
          const userId = typeof data?.user === 'object' ? data.user?.id : data?.user;
          if (!userId) return data;

          // Check if user belongs to a company with a policy
          const profileResult = await req.payload.find({
            collection: 'user-profiles',
            where: { user: { equals: userId } },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          });

          const profile = profileResult.docs[0] as { company?: unknown } | undefined;
          const companyId =
            profile?.company && typeof profile.company === 'object'
              ? (profile.company as { id?: number }).id
              : profile?.company;
          if (!companyId) return data; // No company = no policy

          const policyResult = await req.payload.find({
            collection: 'company-policies' as any,
            where: { company: { equals: companyId } },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          });

          const policy = policyResult.docs[0] as Record<string, unknown> | undefined;
          if (!policy) return data; // No policy = allow everything

          // Check allowed/blocked programs
          const roundId = typeof data?.round === 'object' ? data.round?.id : data?.round;
          if (roundId) {
            const roundDoc = await req.payload.findByID({
              collection: 'rounds',
              id: roundId,
              depth: 0,
              overrideAccess: true,
              req,
            });

            const programId =
              typeof (roundDoc as any)?.program === 'object'
                ? (roundDoc as any).program?.id
                : (roundDoc as any)?.program;

            if (programId) {
              const allowed = policy.allowedPrograms as number[] | undefined;
              const blocked = policy.blockedPrograms as number[] | undefined;

              if (blocked && Array.isArray(blocked) && blocked.length > 0) {
                if (blocked.includes(programId)) {
                  throw new Error('This program is blocked by your company policy');
                }
              }

              if (allowed && Array.isArray(allowed) && allowed.length > 0) {
                if (!allowed.includes(programId)) {
                  throw new Error('This program is not in your company\'s allowed list');
                }
              }
            }
          }

          // If requireApproval is set, change status to pending_approval
          if (policy.requireApproval === true) {
            return { ...data, status: 'pending_approval' };
          }

          return data;
        } catch (err) {
          // Re-throw policy errors (they have specific messages)
          if (err instanceof Error && err.message.includes('company policy')) {
            throw err;
          }
          // Log other errors but don't block the booking
          console.error('[Bookings] beforeChange policy check failed (non-blocking):', err);
          return data;
        }
      },
      // Initialize checkoutStartedAt for abandoned cart recovery
      async ({ data, operation }) => {
        if (operation === 'create' && data.status === 'pending' && !data.checkoutStartedAt) {
          return {
            ...data,
            checkoutStartedAt: new Date().toISOString(),
          };
        }
        return data;
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
      // B2B Manager notification on booking changes
      async ({ req, doc, previousDoc, operation }) => {
        try {
          const userId = typeof doc.user === 'object' ? doc.user?.id : doc.user;
          if (!userId) return;

          // Check if user belongs to a company
          const profileResult = await req.payload.find({
            collection: 'user-profiles',
            where: { user: { equals: userId } },
            depth: 0,
            limit: 1,
            overrideAccess: true,
            req,
          });

          const profile = profileResult.docs[0] as { company?: unknown; user?: unknown } | undefined;
          const companyId =
            profile?.company && typeof profile.company === 'object'
              ? (profile.company as { id?: number }).id
              : (profile?.company as number | undefined);

          if (!companyId) return; // Not a company member

          // Get user name
          const userDoc = await req.payload.findByID({
            collection: 'users',
            id: userId,
            depth: 0,
            overrideAccess: true,
            req,
          });
          const memberName = `${(userDoc as any)?.firstName || ''} ${(userDoc as any)?.lastName || ''}`.trim() || 'Team Member';

          // Get program title from round
          const roundId = typeof doc.round === 'object' ? doc.round?.id : doc.round;
          let programTitle = 'Program';
          if (roundId) {
            const roundDoc = await req.payload.findByID({
              collection: 'rounds',
              id: roundId,
              depth: 1,
              overrideAccess: true,
              req,
            });
            const program = (roundDoc as any)?.program;
            programTitle = (typeof program === 'object' ? program?.titleEn || program?.titleAr : null) || 'Program';
          }

          const { notifyMemberBooked, notifyMemberCancelled } = await import('../lib/b2b-notifications.ts');

          if (operation === 'create') {
            await notifyMemberBooked(req.payload as any, {
              companyId,
              memberName,
              programTitle,
            });
          } else if (operation === 'update') {
            const statusChanged = previousDoc?.status !== doc.status;
            if (statusChanged) {
              if (doc.status === 'cancelled' || doc.status === 'refunded' || doc.status === 'cancelled_overdue') {
                await notifyMemberCancelled(req.payload as any, {
                  companyId,
                  memberName,
                  programTitle,
                });
              }
            }
          }
        } catch (err) {
          console.error('[Bookings] B2B notification hook failed (non-blocking):', err);
        }
      },
    ],
  },
  fields: [
    { name: 'bookingCode', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'round', type: 'relationship', relationTo: 'rounds' },
    { name: 'event', type: 'relationship', relationTo: 'events' },
    { name: 'paymentPlan', type: 'relationship', relationTo: 'payment-plans' },
    { name: 'installmentRequest', type: 'relationship', relationTo: 'installment-requests' },
    {
      name: 'status',
      type: 'select',
      options: ['reserved', 'pending', 'pending_approval', 'confirmed', 'cancelled', 'completed', 'refunded', 'payment_failed', 'cancelled_overdue'],
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
    { name: 'reminderSent24h', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'reminderSent1h', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'cartRecovery1hSent', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'cartRecovery24hSent', type: 'checkbox', defaultValue: false, admin: { readOnly: true, position: 'sidebar' } },
    { name: 'checkoutStartedAt', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'cancelledAt', type: 'date' },
    { name: 'cancellationReason', type: 'textarea' },
    {
      name: 'bookingType',
      type: 'select',
      defaultValue: 'b2c',
      options: [
        { label: 'B2C (Individual)', value: 'b2c' },
        { label: 'B2B (Corporate)', value: 'b2b' },
      ],
      admin: {
        description: 'Whether this booking is an individual or corporate enrollment',
      },
    },
    { name: 'refundAmount', type: 'number' },
    { name: 'refundDate', type: 'date' },
  ],
};
