import { APIError, type CollectionConfig } from 'payload';
import {
  isAdmin,
  isAdminOrOwnerOrOwnInstructor,
  isAdminOrOwnInstructorForUpdate,
  isAuthenticated,
} from '../lib/access-control.ts';
import { createCrmDedupeKey } from '../lib/crm/dedupe.ts';
import { enqueueCrmSyncEvent } from '../lib/crm/queue.ts';
import { sendConsultationCancelled } from '../lib/email/engagement-emails.ts';
import { sendInstructorConsultationCancelled } from '../lib/email/instructor-emails.ts';

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
    beforeChange: [
      async ({ data, req, originalDoc, operation }) => {
        // Enforce minCancelNoticeHours
        if (operation === 'update' && data.status === 'cancelled' && originalDoc?.status !== 'cancelled') {
          const isAdmin = req.user?.role === 'admin';
          if (!isAdmin && originalDoc?.consultationType) {
            try {
              const consultationTypeId = typeof originalDoc.consultationType === 'object' 
                ? originalDoc.consultationType.id 
                : originalDoc.consultationType;
                
              const consultationType = await req.payload.findByID({
                collection: 'consultation-types',
                id: consultationTypeId as string | number,
                depth: 0,
              });

              if (consultationType?.minCancelNoticeHours) {
                if (originalDoc.bookingDate && originalDoc.startTime) {
                  const bookingDateOnly = String(originalDoc.bookingDate).split('T')[0];
                  const bookingDateTimeStr = `${bookingDateOnly}T${originalDoc.startTime}:00`;
                  const bookingTime = new Date(bookingDateTimeStr).getTime();
                  const now = Date.now();

                  const hoursDiff = (bookingTime - now) / (1000 * 60 * 60);
                  if (hoursDiff < Number(consultationType.minCancelNoticeHours)) {
                    throw new APIError(`Cancellations require at least ${consultationType.minCancelNoticeHours} hours notice.`);
                  }
                }
              }
            } catch (err) {
              if (err instanceof APIError) throw err;
              console.error('[ConsultationBookings] Error checking minCancelNoticeHours:', err);
            }
          }
        }
        return data;
      }
    ],
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
              
              // Trigger Cancellation Emails
              if (doc.status === 'cancelled') {
                try {
                  const fullDoc = await req.payload.findByID({
                    collection: 'consultation-bookings',
                    id: doc.id,
                    depth: 2,
                  });

                  if (
                    fullDoc && 
                    typeof fullDoc.user === 'object' && fullDoc.user !== null && 
                    typeof fullDoc.instructor === 'object' && fullDoc.instructor !== null
                  ) {
                    const studentUser = fullDoc.user as any;
                    const instructorDoc = fullDoc.instructor as any;
                    
                    const instructorUserQuery = await req.payload.find({
                      collection: 'users',
                      where: { instructorId: { equals: instructorDoc.id } },
                      limit: 1,
                    });
                    
                    const instructorUser = instructorUserQuery.docs[0] as any;
                    const dateStr = fullDoc.bookingDate && typeof fullDoc.bookingDate === 'string' ? fullDoc.bookingDate.split('T')[0] : String(fullDoc.bookingDate);
                    
                    if (studentUser.email) {
                      await sendConsultationCancelled({
                        to: studentUser.email,
                        userName: studentUser.firstName || 'Student',
                        instructor: instructorDoc.fullNameAr || instructorDoc.fullNameEn || 'Instructor',
                        date: dateStr,
                        reason: 'Cancelled by system / user request',
                      });
                    }
                    
                    if (instructorUser && instructorUser.email) {
                      await sendInstructorConsultationCancelled({
                        to: instructorUser.email,
                        userName: instructorUser.firstName || 'Instructor',
                        clientName: studentUser.firstName || studentUser.email || 'Client',
                        date: dateStr,
                        reason: 'Cancelled by system / user request',
                      });
                    }
                  }
                } catch (emailErr) {
                  console.error('[ConsultationBookings] Failed to send cancellation emails:', emailErr);
                }
              }
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
              bookingDate: doc.bookingDate,
              startTime: doc.startTime,
              endTime: doc.endTime,
              timezone: doc.timezone,
              status: doc.status,
              paymentStatus: doc.paymentStatus,
              amount: doc.amount,
              updatedAt: doc.updatedAt,
            },
          });
        } catch (err) {
          console.error('[ConsultationBookings] afterChange CRM sync failed (non-blocking):', err);
        }

        // Slot sync for explicit consultation-slots is removed as part of dynamic booking engine.
      },
    ],
  },
  fields: [
    { name: 'bookingCode', type: 'text', unique: true, admin: { readOnly: true } },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'consultationType', type: 'relationship', relationTo: 'consultation-types', required: true },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    { name: 'bookingDate', type: 'date', required: true, admin: { description: 'The scheduled date in UTC.' } },
    { name: 'startTime', type: 'text', required: true, admin: { description: 'e.g., 14:30' } },
    { name: 'endTime', type: 'text', required: true, admin: { description: 'e.g., 15:00' } },
    { name: 'timezone', type: 'text', defaultValue: 'Africa/Cairo', required: true },
    { name: 'clientName', type: 'text' },
    { name: 'clientEmail', type: 'text' },
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
