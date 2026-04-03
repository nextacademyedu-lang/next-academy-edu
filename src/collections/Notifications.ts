import type { CollectionConfig } from 'payload';
import { isAdmin, isAdminOrOwner, isAuthenticated } from '../lib/access-control.ts';

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: { useAsTitle: 'title' },
  access: {
    read: isAdminOrOwner,
    create: isAdmin,
    update: isAdminOrOwner,
    delete: isAdmin,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        'booking_confirmed', 'payment_reminder', 'payment_received',
        'round_starting', 'session_reminder', 'booking_cancelled',
        'round_cancelled', 'consultation_confirmed', 'consultation_reminder',
        'installment_approved', 'installment_rejected',
        'certificate_ready', 'waitlist_available', 'payment_overdue',
        'access_blocked', 'refund_approved', 'review_request',
        // B2B Manager notification types
        'b2b_member_booked', 'b2b_member_cancelled',
        'b2b_invitation_accepted', 'b2b_seats_low',
        'b2b_budget_threshold', 'b2b_member_joined', 'b2b_member_removed',
      ],
    },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    { name: 'actionUrl', type: 'text' },
    { name: 'isRead', type: 'checkbox', defaultValue: false },
    { name: 'readAt', type: 'date' },
  ],
};
