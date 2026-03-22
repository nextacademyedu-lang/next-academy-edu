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

function getTokensFromCookieHeader(cookieHeader: string): string[] {
  const tokens: string[] = [];
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey !== 'payload-token') continue;
    const joined = rawValue.join('=').trim();
    if (!joined) continue;
    try {
      tokens.push(decodeURIComponent(joined));
    } catch {
      tokens.push(joined);
    }
  }
  return tokens;
}

function dedupeTokens(tokens: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const token of tokens) {
    const normalized = token.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }
  return unique;
}

/**
 * Robust auth resolver for App Router handlers.
 * In production, some requests may carry auth via cookies only or with varying authorization schemes.
 */
export async function authenticateRequestUser(payload: any, req: NextRequest): Promise<any | null> {
  const baseHeaders = buildBaseHeaders(req);
  const cookieHeader = req.headers.get('cookie') || '';
  const requestCookieTokens = (req.cookies.getAll?.('payload-token') || [])
    .map((cookie) => cookie.value)
    .filter(Boolean);
  const headerCookieTokens = cookieHeader ? getTokensFromCookieHeader(cookieHeader) : [];
  const cookieTokens = dedupeTokens([...requestCookieTokens, ...headerCookieTokens]);

  const candidates: AuthCandidateHeaders[] = [baseHeaders];

  for (const cookieToken of cookieTokens) {
    candidates.unshift(...addAuthHeaders(baseHeaders, cookieToken));
    candidates.push(
      // Cookie only
      { ...baseHeaders, cookie: `payload-token=${cookieToken}` },
      // Header + cookie
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
