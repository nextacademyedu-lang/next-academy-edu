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
    read: isAdminOrOwnerByField('requestedBy'),
    create: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
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
