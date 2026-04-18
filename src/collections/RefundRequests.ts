import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwnerByField, isAuthenticated } from '../lib/access-control.ts';

export const RefundRequests: CollectionConfig = {
  slug: 'refund-requests',
  admin: {
    useAsTitle: 'id',
    group: 'Finance',
    defaultColumns: ['id', 'amount', 'status', 'reason', 'processedAt', 'createdAt'],
  },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        if (doc.status === 'processed' && previousDoc?.status !== 'processed') {
          const paymentId = typeof doc.payment === 'object' ? doc.payment?.id : doc.payment;
          const bookingId = typeof doc.booking === 'object' ? doc.booking?.id : doc.booking;

          // 1. Update Payment -> refunded
          if (paymentId) {
            try {
              await req.payload.update({
                collection: 'payments',
                id: paymentId,
                data: {
                  status: 'refunded',
                },
                overrideAccess: true,
                req,
              });
            } catch (err) {
              console.error('[RefundRequests] Failed to update Payment to refunded:', err);
            }
          }

          // 2. Update Booking -> refunded + record refund details
          if (bookingId) {
            try {
              await req.payload.update({
                collection: 'bookings',
                id: bookingId,
                data: {
                  status: 'refunded',
                  refundAmount: doc.amount,
                  refundDate: new Date().toISOString(),
                },
                overrideAccess: true,
                req,
              });
            } catch (err) {
              console.error('[RefundRequests] Failed to update Booking to refunded:', err);
            }
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'booking',
      type: 'relationship',
      relationTo: 'bookings',
      required: true,
    },
    {
      name: 'payment',
      type: 'relationship',
      relationTo: 'payments',
      required: true,
    },
    {
      name: 'requestedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }: { user: any }) => user?.id,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'reason',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Processed', value: 'processed' },
      ],
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Admin who approved this refund request',
      },
    },
    {
      name: 'gatewayRefundId',
      type: 'text',
      admin: {
        description: 'ID returned from payment gateway after refund processing',
      },
    },
    {
      name: 'processedAt',
      type: 'date',
    },
    {
      name: 'adminNotes',
      type: 'textarea',
    },
  ],
};
