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

export interface PayloadEvent {
  id: string;
  titleAr: string;
  titleEn?: string;
  eventDate: string;
  eventEndDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  locationAddress?: string;
  locationType?: 'online' | 'in_person' | 'hybrid';
  onlineLink?: string;
  currency?: 'EGP' | 'USD' | 'EUR' | 'SAR';
  slug?: string;
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
  round?: PayloadRound | string;
  event?: PayloadEvent | string;
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
  gender?: 'male' | 'female';
}

export interface ExtendedProfilePayload {
  title?: string;
  jobTitle?: string;
  workField?: string;
  yearsOfExperience?: string;
  company?: number | string;
  companySize?: string;
  companyType?: string;
  country?: string;
  city?: string;
  linkedinUrl?: string;
  learningGoals?: string;
  howDidYouHear?: string;
  interests?: string[];
}

export interface ExtendedProfileData {
  id: string;
  title?: string;
  jobTitle?: string;
  workField?: string;
  yearsOfExperience?: string;
  company?: { id: string; name: string } | string | number | null;
  companySize?: string;
  companyType?: string;
  country?: string;
  city?: string;
  linkedinUrl?: string;
  learningGoals?: string;
  howDidYouHear?: string;
  interests?: Array<{ id: string; name?: string; title?: string }> | string[];
  onboardingCompleted?: boolean;
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

export async function getUserExtendedProfile(
  userId: string,
): Promise<AuthResponse<PayloadListResponse<ExtendedProfileData>>> {
  const response = await fetch(
    `/api/user-profiles?where[user][equals]=${userId}&depth=1&limit=1`,
    { credentials: 'include' },
  );
  return handleResponse<PayloadListResponse<ExtendedProfileData>>(response);
}

export async function updateUserExtendedProfile(
  profileId: string,
  data: ExtendedProfilePayload,
): Promise<AuthResponse<{ doc: Record<string, unknown> }>> {
  const response = await fetch(`/api/user-profiles/${profileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return handleResponse<{ doc: Record<string, unknown> }>(response);
}

export async function createUserExtendedProfile(
  userId: string,
  data: ExtendedProfilePayload,
): Promise<AuthResponse<{ doc: Record<string, unknown> }>> {
  const response = await fetch('/api/user-profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ user: userId, ...data }),
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

/** Extract program/event title preferring English, fallback to Arabic */
export function getProgramTitle(booking: PayloadBooking): string {
  if (booking.event) {
    const event = booking.event as PayloadEvent;
    if (typeof event === 'string') return 'Event';
    return event.titleEn || event.titleAr || 'Event';
  }
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return 'Program';
  const program = round.program as PayloadProgram;
  if (!program || typeof program === 'string') return round.title || 'Program';
  return program.titleEn || program.titleAr || 'Program';
}

/** Extract round/event display name */
export function getRoundTitle(booking: PayloadBooking): string {
  if (booking.event) {
    const event = booking.event as PayloadEvent;
    if (typeof event === 'string') return '';
    return new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return '';
  return round.title || new Date(round.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Extract meeting URL from booking */
export function getMeetingUrl(booking: PayloadBooking): string | null {
  if (booking.event) {
    const event = booking.event as PayloadEvent;
    if (typeof event === 'string') return null;
    return event.onlineLink || null;
  }
  const round = booking.round as PayloadRound;
  if (!round || typeof round === 'string') return null;
  return round.meetingUrl || null;
}

/** Get program/event type label */
export function getProgramType(booking: PayloadBooking): string {
  if (booking.event) return 'Event';
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

// ─────────────────────────────────────────────
// Sessions (for Course Player)
// ─────────────────────────────────────────────

export interface PayloadSession {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingUrl?: string;
  recordingUrl?: string;
  materials?: Array<{
    name?: string;
    alt?: string;
    filename?: string;
    url?: string | null;
    file?: { url?: string | null } | null;
  }>;
  isCancelled?: boolean;
  order?: number;
  round?: string | { id: string };
}

export async function getBookingSessions(roundId: string): Promise<AuthResponse<PayloadListResponse<PayloadSession>>> {
  const response = await fetch(
    `/api/sessions?where[round][equals]=${roundId}&sort=date&depth=1&limit=100`,
    { credentials: 'include' },
  );
  return handleResponse<PayloadListResponse<PayloadSession>>(response);
}

export async function getBookingsForCourses(): Promise<AuthResponse<PayloadListResponse<PayloadBooking>>> {
  const response = await fetch(
    '/api/bookings?where[status][in]=confirmed,completed&depth=2&sort=-createdAt&limit=50',
    { credentials: 'include' },
  );
  return handleResponse<PayloadListResponse<PayloadBooking>>(response);
}

// ─────────────────────────────────────────────
// Event Detail Helpers for Booking Cards
// ─────────────────────────────────────────────

export interface BookingEventDetails {
  date: string;
  time?: string;
  venue?: string;
  locationType: 'online' | 'in_person' | 'hybrid' | 'unknown';
  calendarUrl?: string;
  isFree: boolean;
}

/** Extract detailed event/round info from a booking */
export function getBookingEventDetails(booking: PayloadBooking): BookingEventDetails {
  const isFree = booking.totalAmount <= 0 && ['confirmed', 'completed'].includes(booking.status);

  if (booking.event && typeof booking.event === 'object') {
    const ev = booking.event as PayloadEvent;
    const dateStr = new Date(ev.eventDate).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
    const time = ev.startTime
      ? `${ev.startTime}${ev.endTime ? ` - ${ev.endTime}` : ''}`
      : undefined;

    return {
      date: dateStr,
      time,
      venue: ev.venue || ev.locationAddress || undefined,
      locationType: ev.locationType || 'unknown',
      calendarUrl: buildGoogleCalendarUrl(
        ev.titleEn || ev.titleAr,
        ev.eventDate,
        ev.eventEndDate || ev.eventDate,
        ev.venue || ev.locationAddress || (ev.locationType === 'online' ? 'Online' : ''),
      ),
      isFree,
    };
  }

  const round = booking.round as PayloadRound;
  if (round && typeof round === 'object') {
    const dateStr = new Date(round.startDate).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
    const program = round.program as PayloadProgram;
    const title = program && typeof program === 'object'
      ? (program.titleEn || program.titleAr)
      : 'Program';

    return {
      date: dateStr,
      venue: round.locationType === 'online' ? 'Online' : undefined,
      locationType: (round.locationType === 'in-person' ? 'in_person' : round.locationType) as BookingEventDetails['locationType'] || 'unknown',
      calendarUrl: buildGoogleCalendarUrl(
        title,
        round.startDate,
        round.endDate || round.startDate,
        round.locationType === 'online' ? 'Online' : '',
      ),
      isFree,
    };
  }

  return {
    date: new Date(booking.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }),
    locationType: 'unknown',
    isFree,
  };
}

/** Build a Google Calendar add-event URL */
function buildGoogleCalendarUrl(
  title: string,
  startDate: string,
  endDate: string,
  location: string,
): string {
  const formatDate = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const start = formatDate(startDate);
  const end = formatDate(endDate || startDate);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    location: location || '',
    details: `Booked via Next Academy`,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}
