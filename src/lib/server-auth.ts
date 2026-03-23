import crypto from 'node:crypto';
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

function getTokensFromAuthorizationHeader(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) return [];
  const [scheme, token] = trimmed.split(/\s+/, 2);
  if (!token) return [];
  const normalizedScheme = scheme.toLowerCase();
  if (normalizedScheme !== 'bearer' && normalizedScheme !== 'jwt') return [];
  return [token];
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

function toHeaders(record: AuthCandidateHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(record)) {
    headers.set(key, value);
  }
  return headers;
}

function safeEqualBase64Url(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyHs256PayloadToken(token: string, secret: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signaturePart] = parts;
  try {
    const headerRaw = Buffer.from(headerPart, 'base64url').toString('utf8');
    const header = JSON.parse(headerRaw) as { alg?: string; typ?: string };
    if (header.alg !== 'HS256') return null;

    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${headerPart}.${payloadPart}`)
      .digest('base64url');

    if (!safeEqualBase64Url(signaturePart, expectedSig)) return null;

    const payloadRaw = Buffer.from(payloadPart, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadRaw) as Record<string, unknown>;

    const exp = typeof payload.exp === 'number' ? payload.exp : 0;
    if (!exp || exp <= Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

async function resolveUserFromVerifiedToken(payload: any, token: string): Promise<any | null> {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) return null;

  const jwtPayload = verifyHs256PayloadToken(token, secret);
  if (!jwtPayload) return null;

  const collection = String(jwtPayload.collection || '');
  if (collection !== 'users') return null;

  const id = jwtPayload.id;
  if (!id) return null;

  try {
    const user = await payload.findByID({
      collection: 'users',
      id,
      depth: 0,
      overrideAccess: true,
    });
    return user ?? null;
  } catch {
    return null;
  }
}

/**
 * Robust auth resolver for App Router handlers.
 * In production, cookies can appear in multiple scopes (host + domain cookie),
 * so we try all token candidates and include a cryptographic fallback verifier.
 */
export async function authenticateRequestUser(payload: any, req: NextRequest): Promise<any | null> {
  const baseHeaders = buildBaseHeaders(req);
  const cookieHeader = req.headers.get('cookie') || '';
  const authHeader = req.headers.get('authorization') || '';

  const requestCookieTokens = (req.cookies.getAll?.('payload-token') || [])
    .map((cookie) => cookie.value)
    .filter(Boolean);
  const headerCookieTokens = cookieHeader ? getTokensFromCookieHeader(cookieHeader) : [];
  const authHeaderTokens = authHeader ? getTokensFromAuthorizationHeader(authHeader) : [];

  const cookieTokens = dedupeTokens([
    ...requestCookieTokens,
    ...headerCookieTokens,
    ...authHeaderTokens,
  ]);

  const candidates: AuthCandidateHeaders[] = [baseHeaders];

  for (const cookieToken of cookieTokens) {
    candidates.unshift(...addAuthHeaders(baseHeaders, cookieToken));
    candidates.push(
      // Cookie only
      { ...baseHeaders, cookie: `payload-token=${cookieToken}` },
      // Header + cookie
      { authorization: `JWT ${cookieToken}`, cookie: `payload-token=${cookieToken}` },
      { authorization: `Bearer ${cookieToken}`, cookie: `payload-token=${cookieToken}` },
      // Minimal header variants
      { authorization: `JWT ${cookieToken}` },
      { authorization: `Bearer ${cookieToken}` },
    );
  }

  for (const headers of candidates) {
    try {
      const { user } = await payload.auth({ headers: toHeaders(headers) });
      if (user) return user;
    } catch {
      // Continue trying other candidates.
    }
  }

  // Fallback: verify JWT locally and fetch user by ID.
  // This prevents false negatives when upstream auth parsing fails because of duplicate cookies.
  for (const token of cookieTokens) {
    const user = await resolveUserFromVerifiedToken(payload, token);
    if (user) return user;
  }

  return null;
}
