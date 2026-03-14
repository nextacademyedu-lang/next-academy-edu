import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

// Routes that require authentication
const PROTECTED_PATTERNS = ['/dashboard', '/instructor', '/checkout', '/b2b-dashboard', '/onboarding'];

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPath(pathname: string): string | null {
  const locales = ['ar', 'en'];
  const segments = pathname.split('/');
  if (segments.length > 1 && locales.includes(segments[1])) {
    return segments[1];
  }
  return null;
}

function stripLocale(pathname: string): string {
  const locale = getLocaleFromPath(pathname);
  if (locale) {
    return pathname.replace(`/${locale}`, '') || '/';
  }
  return pathname;
}

/** Security headers applied to every page response */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, admin, static assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Run next-intl middleware first for locale handling
  const intlResponse = intlMiddleware(request);

  const pathWithoutLocale = stripLocale(pathname);
  const locale = getLocaleFromPath(pathname) || 'ar';
  const token = request.cookies.get('payload-token')?.value;

  // Check if path matches a protected pattern
  const isProtected = PROTECTED_PATTERNS.some(
    (pattern) => pathWithoutLocale === pattern || pathWithoutLocale.startsWith(`${pattern}/`)
  );

  // Protected route, no token → redirect to login with redirect param
  if (isProtected && !token) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // NOTE: We do NOT redirect authenticated users away from auth routes
  // in middleware because the token may be stale/invalid (e.g. user was
  // deleted from DB but cookie remains). Instead, the login/register
  // pages handle this client-side via the auth context.

  return applySecurityHeaders(intlResponse);
}

export const config = {
  // Match all paths except those starting with api, admin, _next, _vercel, or containing a dot
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)',],
};
