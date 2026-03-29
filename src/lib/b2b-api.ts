/**
 * B2B Manager API Helpers
 * Typed fetch wrappers for B2B dashboard endpoints.
 * Uses credentials: 'include' — access control auto-filters to logged-in b2b_manager's company.
 */

import type { AuthResponse } from './auth-api';
import type { PayloadListResponse } from './dashboard-api';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface B2BCompany {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  type?: string;
  country?: string;
  city?: string;
}

export interface B2BTeamMember {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  profile?: {
    jobTitle?: string;
    title?: string;
  };
  bookings_count: number;
  last_booking_date?: string;
}

export interface B2BInvitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  company: {
    id: string;
    name: string;
  };
  jobTitle?: string | null;
  title?: string | null;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface B2BBooking {
  id: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | string;
  round: {
    id: string;
    title?: string;
    startDate: string;
    program: {
      id: string;
      titleAr: string;
      titleEn?: string;
      type: string;
    } | string;
  } | string;
}

export interface B2BStats {
  total_bookings: number;
  total_spent: number;
  active_programs: number;
  team_size: number;
}

export interface B2BDashboardData {
  company: B2BCompany;
  team_members: B2BTeamMember[];
  stats: B2BStats;
  recent_bookings: B2BBooking[];
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
// Dashboard
// ─────────────────────────────────────────────

export async function getB2BDashboard(): Promise<AuthResponse<B2BDashboardData>> {
  const res = await fetch('/api/b2b/dashboard', { credentials: 'include' });
  return handleResponse<B2BDashboardData>(res);
}

// ─────────────────────────────────────────────
// Team
// ─────────────────────────────────────────────

export async function getB2BTeam(page = 1): Promise<AuthResponse<PayloadListResponse<B2BTeamMember>>> {
  const res = await fetch(`/api/b2b/team?page=${page}&limit=20`, { credentials: 'include' });
  return handleResponse<PayloadListResponse<B2BTeamMember>>(res);
}

export async function getB2BInvitations(
  status: 'all' | 'pending' | 'accepted' | 'revoked' | 'expired' = 'pending',
): Promise<AuthResponse<PayloadListResponse<B2BInvitation>>> {
  const res = await fetch(`/api/b2b/invitations?status=${status}`, { credentials: 'include' });
  return handleResponse<PayloadListResponse<B2BInvitation>>(res);
}

export async function inviteB2BTeamMember(payload: {
  email?: string;
  jobTitle?: string;
  title?: string;
  locale?: 'ar' | 'en';
}): Promise<
  AuthResponse<{
    invitation?: B2BInvitation;
    created?: boolean;
    emailSent?: boolean;
    previewUrl?: string;
    alreadyMember?: boolean;
    message?: string;
  }>
> {
  const res = await fetch('/api/b2b/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  return handleResponse<{
    invitation?: B2BInvitation;
    created?: boolean;
    emailSent?: boolean;
    previewUrl?: string;
    alreadyMember?: boolean;
    message?: string;
  }>(res);
}

export async function revokeB2BInvitation(
  invitationId: string,
): Promise<AuthResponse<{ revoked: boolean; invitationId: string }>> {
  const res = await fetch('/api/b2b/invitations', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ invitationId }),
  });
  return handleResponse<{ revoked: boolean; invitationId: string }>(res);
}

// Backward-compatible alias used by old callers.
export const addB2BTeamMember = inviteB2BTeamMember;

export async function resendB2BInvitation(payload: {
  email: string;
  jobTitle?: string;
  title?: string;
  locale?: 'ar' | 'en';
}): Promise<
  AuthResponse<{
    invitation?: B2BInvitation;
    created?: boolean;
    emailSent?: boolean;
    previewUrl?: string;
  }>
> {
  return inviteB2BTeamMember(payload);
}

export async function removeB2BTeamMember(
  userId: string,
): Promise<AuthResponse<{ removed: boolean; userId: string }>> {
  const res = await fetch('/api/b2b/team', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId }),
  });
  return handleResponse<{ removed: boolean; userId: string }>(res);
}

// ─────────────────────────────────────────────
// Bookings
// ─────────────────────────────────────────────

export async function getB2BBookings(status = 'all', page = 1): Promise<AuthResponse<PayloadListResponse<B2BBooking>>> {
  const res = await fetch(`/api/b2b/bookings?status=${status}&page=${page}&limit=20`, { credentials: 'include' });
  return handleResponse<PayloadListResponse<B2BBooking>>(res);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getB2BBookingProgramTitle(booking: B2BBooking): string {
  const round = booking.round as { program: { titleEn?: string; titleAr: string } | string } | null;
  if (!round || typeof round === 'string') return 'Program';
  const program = round.program;
  if (!program || typeof program === 'string') return 'Program';
  return program.titleEn || program.titleAr || 'Program';
}

export function getB2BBookingUserName(booking: B2BBooking): string {
  const user = booking.user as { firstName: string; lastName: string } | null;
  if (!user || typeof user === 'string') return 'Employee';
  return `${user.firstName} ${user.lastName}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(amount);
}
