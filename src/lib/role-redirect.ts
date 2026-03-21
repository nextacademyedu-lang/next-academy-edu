/**
 * Role-based dashboard redirect helper.
 * Maps each user role to its correct dashboard path.
 *
 * Source of truth: docs/architecture/roles-permissions.md
 */

import type { UserData } from '@/lib/auth-api';

const DASHBOARD_ROUTES: Record<UserData['role'], string> = {
  user: '/dashboard',
  b2b_manager: '/b2b-dashboard',
  instructor: '/instructor',
  admin: '/admin',
};

/**
 * Returns the full locale-prefixed dashboard path for a given role.
 *
 * @example getDashboardPath('instructor', 'ar') → '/ar/instructor'
 */
export function getDashboardPath(role: UserData['role'], locale: string): string {
  const base = DASHBOARD_ROUTES[role] ?? '/dashboard';
  if (role === 'admin') return '/admin';
  return `/${locale}${base}`;
}

/**
 * Sanitizes a post-auth redirect target to avoid external/open redirects.
 * Accepts only internal absolute paths like `/ar/checkout/123`.
 */
export function getSafeRedirectPath(
  redirect: string | null | undefined,
  fallbackPath: string,
): string {
  if (!redirect) return fallbackPath;

  let normalized = redirect.trim();
  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep original value if it's not URI-encoded.
  }

  if (!normalized.startsWith('/')) return fallbackPath;
  if (normalized.startsWith('//')) return fallbackPath;
  if (normalized.startsWith('/api') || normalized.startsWith('/_next')) return fallbackPath;

  return normalized;
}
