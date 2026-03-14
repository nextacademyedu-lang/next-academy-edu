/**
 * Dashboard API Helpers
 * Typed fetch wrappers for dashboard-related endpoints.
 * Uses the same credentials: 'include' pattern as auth-api.ts.
 * Payload CMS access control auto-filters results to the logged-in user.
 */

import type { AuthResponse } from './auth-api';

// ─────────────────────────────────────────────
// Payload collection types (fields used in dashboard)
// ─────────────────────────────────────────────

export interface PayloadProgram {
  id: string;
  titleAr: string;
  titleEn?: string;
  type: 'workshop' | 'course' | 'webinar';
  thumbnail?: { url: string } | null;
}

export interface PayloadRound {
  id: string;
  title?: string;
  startDate: string;
  endDate?: string;
  locationType: 'online' | 'in-person' | 'hybrid';
  meetingUrl?: string;
  program: PayloadProgram | string;
}

export interface PayloadBooking {
  id: string;
  bookingCode: string;
  status: 'reserved' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded' | 'payment_failed' | 'cancelled_overdue';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  finalAmount: number;
  discountAmount: number;
  round: PayloadRound | string;
  paymentPlan?: { id: string; name: string } | string | null;
  createdAt: string;
}

export interface PayloadPayment {
  id: string;
  paymentCode: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'failed' | 'refunded';
  paymentMethod?: 'paymob' | 'fawry' | 'cash' | 'bank_transfer' | 'voucher';
  installmentNumber?: number;
  receiptUrl?: string;
  booking: PayloadBooking | string;
}

export interface PayloadNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface PayloadListResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// Profile update types
// ─────────────────────────────────────────────

export interface ProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ─────────────────────────────────────────────
// Shared response handler
// ─────────────────────────────────────────────

async function handleResponse<T>(response: Response): Promise<AuthResponse<T>> {
  try {
    const data = await response.json();
    if (!response.ok) {
      const errorMessage =
        data?.errors?.[0]?.message ||
        data?.message ||
        data?.error ||
        'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
    return { success: true, data };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ─────────────────────────────────────────────
// Bookings
// ─────────────────────────────────────────────

export async function getUserBookings(): Promise<AuthResponse<PayloadListResponse<PayloadBooking>>> {
  const response = await fetch('/api/bookings?depth=2&sort=-createdAt&limit=50', {
    credentials: 'include',
  });
  return handleResponse<PayloadListResponse<PayloadBooking>>(response);
}

// ─────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────

export async function getUserPayments(): Promise<AuthResponse<PayloadListResponse<PayloadPayment>>> {
  const response = await fetch('/api/payments?depth=2&sort=-dueDate&limit=100', {
    credentials: 'include',
  });
  return handleResponse<PayloadListResponse<PayloadPayment>>(response);
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export async function getUserNotifications(): Promise<AuthResponse<PayloadListResponse<PayloadNotification>>> {
  const response = await fetch('/api/notifications?sort=-createdAt&limit=10', {
    credentials: 'include',
  });
  return handleResponse<PayloadListResponse<PayloadNotification>>(response);
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export async function updateUserProfile(
  userId: string,
  data: ProfileUpdatePayload,
): Promise<AuthResponse<{ doc: Record<string, unknown> }>> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<{ doc: Record<string, unknown> }>(response);
}

export async function changeUserPassword(
  userId: string,
  password: string,
): Promise<AuthResponse<{ doc: Record<string, unknown> }>> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  });
  return handleResponse<{ doc: Record<string, unknown> }>(response);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Extract program title preferring English, fallback to Arabic */
export function getProgramTitle(booking: PayloadBooking): string {
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return 'Program';
  const program = round.program as PayloadProgram;
  if (!program || typeof program === 'string') return round.title || 'Program';
  return program.titleEn || program.titleAr || 'Program';
}

/** Extract round display name */
export function getRoundTitle(booking: PayloadBooking): string {
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return '';
  return round.title || new Date(round.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Extract meeting URL from booking */
export function getMeetingUrl(booking: PayloadBooking): string | null {
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return null;
  return round.meetingUrl || null;
}

/** Get program type label */
export function getProgramType(booking: PayloadBooking): string {
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return 'Program';
  const program = round.program as PayloadProgram;
  if (!program || typeof program === 'string') return 'Program';
  return program.type.charAt(0).toUpperCase() + program.type.slice(1);
}

/** Format currency in EGP */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Map booking status to display label */
export function getStatusLabel(status: PayloadBooking['status']): string {
  const map: Record<string, string> = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    pending: 'Pending Payment',
    reserved: 'Reserved',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    payment_failed: 'Payment Failed',
    cancelled_overdue: 'Cancelled (Overdue)',
  };
  return map[status] ?? status;
}
