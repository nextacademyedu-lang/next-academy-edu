/**
 * Instructor API Helpers
 * Typed fetch wrappers for instructor portal endpoints.
 * Uses credentials: 'include' — Payload access control auto-filters to logged-in instructor.
 */

import type { AuthResponse } from './auth-api';
import type { PayloadListResponse } from './dashboard-api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface PayloadSession {
  id: string;
  title?: string;
  sessionNumber?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  meetingUrl?: string;
  recordingUrl?: string;
  round: {
    id: string;
    title?: string;
    program: {
      id: string;
      titleAr: string;
      titleEn?: string;
      type: 'workshop' | 'course' | 'webinar';
    } | string;
  } | string;
  attendanceCount?: number;
}

export interface PayloadConsultationBooking {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  meetingUrl?: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  } | string;
  consultationType: {
    id: string;
    title: string;
    durationMinutes: number;
    price: number;
  } | string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  createdAt: string;
}

export interface PayloadConsultationType {
  id: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  description?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  instructor: string;
}

export interface PayloadAvailability {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  dayIndex?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  bufferMinutes?: number;
  isActive: boolean;
  instructor: string;
}

export interface PayloadBlockedDate {
  id: string;
  date: string;
  reason?: string;
  instructor: string;
}

export interface InstructorStats {
  totalStudents: number;
  upcomingSessionsCount: number;
  upcomingConsultationsCount: number;
  totalConsultations: number;
}

// ─────────────────────────────────────────────
// Shared response handler
// ─────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<AuthResponse<T>> {
  try {
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.errors?.[0]?.message || data?.message || 'An error occurred' };
    }
    return { success: true, data };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

// ─────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────

export async function getInstructorSessions(): Promise<AuthResponse<PayloadListResponse<PayloadSession>>> {
  const res = await fetch('/api/sessions?depth=2&sort=-date&limit=50', { credentials: 'include' });
  return handleResponse<PayloadListResponse<PayloadSession>>(res);
}

// ─────────────────────────────────────────────
// Consultation Bookings
// ─────────────────────────────────────────────

export async function getInstructorConsultationBookings(): Promise<AuthResponse<PayloadListResponse<PayloadConsultationBooking>>> {
  const res = await fetch('/api/consultation-bookings?depth=2&sort=-createdAt&limit=50', { credentials: 'include' });
  return handleResponse<PayloadListResponse<PayloadConsultationBooking>>(res);
}

export async function updateConsultationBookingStatus(
  id: string,
  status: PayloadConsultationBooking['status'],
): Promise<AuthResponse<{ doc: PayloadConsultationBooking }>> {
  const res = await fetch(`/api/consultation-bookings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return handleResponse<{ doc: PayloadConsultationBooking }>(res);
}

// ─────────────────────────────────────────────
// Consultation Types
// ─────────────────────────────────────────────

export async function getConsultationTypes(): Promise<AuthResponse<PayloadListResponse<PayloadConsultationType>>> {
  const res = await fetch('/api/consultation-types?depth=1&limit=20', { credentials: 'include' });
  return handleResponse<PayloadListResponse<PayloadConsultationType>>(res);
}

// ─────────────────────────────────────────────
// Availability
// ─────────────────────────────────────────────

export async function getInstructorAvailability(): Promise<AuthResponse<PayloadListResponse<PayloadAvailability>>> {
  const res = await fetch('/api/instructor/availability?limit=50', { credentials: 'include' });
  return handleResponse<PayloadListResponse<PayloadAvailability>>(res);
}

export async function saveInstructorAvailability(
  records: Omit<PayloadAvailability, 'id' | 'instructor'>[],
): Promise<AuthResponse<{ success: boolean }>> {
  const res = await fetch('/api/instructor/availability', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ availability: records }),
  });
  return handleResponse<{ success: boolean }>(res);
}

export async function getBlockedDates(): Promise<AuthResponse<PayloadListResponse<PayloadBlockedDate>>> {
  const res = await fetch('/api/instructor-blocked-dates?depth=1&sort=date&limit=50', { credentials: 'include' });
  return handleResponse<PayloadListResponse<PayloadBlockedDate>>(res);
}

export async function addBlockedDate(
  date: string,
  reason?: string,
): Promise<AuthResponse<{ doc: PayloadBlockedDate }>> {
  const res = await fetch('/api/instructor-blocked-dates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ date, reason }),
  });
  return handleResponse<{ doc: PayloadBlockedDate }>(res);
}

export async function deleteBlockedDate(id: string): Promise<AuthResponse<{ doc: PayloadBlockedDate }>> {
  const res = await fetch(`/api/instructor-blocked-dates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse<{ doc: PayloadBlockedDate }>(res);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getSessionProgramTitle(session: PayloadSession): string {
  const round = session.round as { program: { titleEn?: string; titleAr: string } | string } | null;
  if (!round || typeof round === 'string') return 'Session';
  const program = round.program;
  if (!program || typeof program === 'string') return 'Session';
  return program.titleEn || program.titleAr || 'Session';
}

export function getSessionRoundTitle(session: PayloadSession): string {
  const round = session.round as { title?: string } | null;
  if (!round || typeof round === 'string') return '';
  return round.title || '';
}

export function getConsultationStudentName(booking: PayloadConsultationBooking): string {
  const user = booking.user as { firstName: string; lastName: string } | null;
  if (!user || typeof user === 'string') return 'Student';
  return `${user.firstName} ${user.lastName}`;
}

export function getConsultationStudentEmail(booking: PayloadConsultationBooking): string {
  const user = booking.user as { email: string } | null;
  if (!user || typeof user === 'string') return '';
  return user.email;
}

export function getConsultationTypeTitle(booking: PayloadConsultationBooking): string {
  const type = booking.consultationType as
    | { title?: string; titleAr?: string; titleEn?: string }
    | null;
  if (!type || typeof type === 'string') return 'Consultation';
  return type.title || type.titleEn || type.titleAr || 'Consultation';
}

export function getSlotDateTime(booking: PayloadConsultationBooking): { date: string; time: string } {
  const slot = booking.slot as { date: string; startTime: string; endTime: string } | null;
  if (!slot || typeof slot === 'string') return { date: '—', time: '—' };
  const date = new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return { date, time: `${slot.startTime} - ${slot.endTime}` };
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─────────────────────────────────────────────
// Earnings
// ─────────────────────────────────────────────

export interface PayloadEarning {
  id: string;
  bookingCode: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
  discountAmount: number;
  createdAt: string;
  slot: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
  } | string;
  consultationType: {
    id: string;
    title: string;
    durationMinutes: number;
  } | string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
}

export async function getInstructorEarnings(): Promise<AuthResponse<PayloadListResponse<PayloadEarning>>> {
  const res = await fetch(
    '/api/consultation-bookings?depth=2&sort=-createdAt&limit=100&where[paymentStatus][not_equals]=pending',
    { credentials: 'include' },
  );
  return handleResponse<PayloadListResponse<PayloadEarning>>(res);
}

export function getEarningStudentName(e: PayloadEarning): string {
  const user = e.user as { firstName: string; lastName: string } | null;
  if (!user || typeof user === 'string') return 'Student';
  return `${user.firstName} ${user.lastName}`;
}

export function getEarningTypeTitle(e: PayloadEarning): string {
  const t = e.consultationType as
    | { title?: string; titleAr?: string; titleEn?: string }
    | null;
  if (!t || typeof t === 'string') return 'Consultation';
  return t.title || t.titleEn || t.titleAr || 'Consultation';
}

export function getEarningDuration(e: PayloadEarning): number {
  const t = e.consultationType as { durationMinutes: number } | null;
  if (!t || typeof t === 'string') return 0;
  return t.durationMinutes;
}

export function getEarningDate(e: PayloadEarning): string {
  const slot = e.slot as { date: string } | null;
  if (!slot || typeof slot === 'string') return new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
