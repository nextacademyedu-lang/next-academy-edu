import type { NextRequest } from 'next/server';

type AuthCandidateHeaders = Record<string, string>;

function buildBaseHeaders(req: NextRequest): AuthCandidateHeaders {
  const headers: AuthCandidateHeaders = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
}

function addAuthHeaders(base: AuthCandidateHeaders, token: string): AuthCandidateHeaders[] {
  return [
    { ...base, authorization: `JWT ${token}` },
    { ...base, authorization: `Bearer ${token}` },
  ];
}

function getTokenFromCookieHeader(cookieHeader: string): string | null {
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey !== 'payload-token') continue;
    const joined = rawValue.join('=').trim();
    if (!joined) return null;
    return decodeURIComponent(joined);
  }
  return null;
}

/**
 * Robust auth resolver for App Router handlers.
 * In production, some requests may carry auth via cookies only or with varying authorization schemes.
 */
export async function authenticateRequestUser(payload: any, req: NextRequest): Promise<any | null> {
  const baseHeaders = buildBaseHeaders(req);
  const cookieHeader = req.headers.get('cookie') || '';
  const cookieToken =
    req.cookies.get('payload-token')?.value ||
    (cookieHeader ? getTokenFromCookieHeader(cookieHeader) : null) ||
    null;

  const candidates: AuthCandidateHeaders[] = [baseHeaders];

  if (cookieToken) {
    candidates.unshift(...addAuthHeaders(baseHeaders, cookieToken));

    // Last-resort minimal headers with token + cookie only
    candidates.push(
      { authorization: `JWT ${cookieToken}`, cookie: `payload-token=${cookieToken}` },
      { authorization: `Bearer ${cookieToken}`, cookie: `payload-token=${cookieToken}` },
    );
  }

  for (const headers of candidates) {
    try {
      const { user } = await payload.auth({ headers });
      if (user) return user;
    } catch {
      // Continue trying other candidates.
    }
  }

  return null;
}
