import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ALLOWED_ORIGINS = new Set<string>([
  'https://nextacademyedu.com',
  'https://www.nextacademyedu.com',
]);

function isUnsafeMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function allowedOrigins(): Set<string> {
  const origins = new Set<string>(DEFAULT_ALLOWED_ORIGINS);
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000');
    origins.add('http://127.0.0.1:3000');
  }

  const envOrigins = process.env.CSRF_ALLOWED_ORIGINS || '';
  envOrigins
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((value) => origins.add(value));

  return origins;
}

function getRequestOrigin(req: NextRequest): string | null {
  const originHeader = req.headers.get('origin');
  if (originHeader) return originHeader;

  const referer = req.headers.get('referer');
  if (!referer) return null;

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

/**
 * Lightweight CSRF guard for cookie-authenticated browser writes.
 * Uses Origin/Referer + Sec-Fetch-Site checks as defense-in-depth.
 */
export function assertTrustedWriteRequest(req: NextRequest): NextResponse | null {
  if (!isUnsafeMethod(req.method)) return null;

  const origin = getRequestOrigin(req);
  const secFetchSite = (req.headers.get('sec-fetch-site') || '').toLowerCase();
  const allowed = allowedOrigins();

  if (secFetchSite && !['same-origin', 'same-site', 'none'].includes(secFetchSite)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  if (!origin || !allowed.has(origin)) {
    return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
  }

  return null;
}
