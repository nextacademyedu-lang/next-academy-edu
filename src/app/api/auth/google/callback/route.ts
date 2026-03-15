/**
 * GET /api/auth/google/callback
 *
 * Google redirects here with ?code=... & state=...
 * 1. Exchange code for tokens with Google
 * 2. Fetch Google user-info
 * 3. Find-or-create Payload user
 * 4. Generate JWT using Node.js crypto (no extra deps)
 * 5. Redirect to the original target
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import crypto from 'node:crypto';

/* ------------------------------------------------------------------ */
/*  Minimal JWT helpers (HS256) — avoids adding jsonwebtoken dep       */
/* ------------------------------------------------------------------ */

function base64url(input: string | Buffer): string {
  const buf = typeof input === 'string' ? Buffer.from(input) : input;
  return buf.toString('base64url');
}

function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds: number,
): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    }),
  );
  const signature = base64url(
    crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest(),
  );
  return `${header}.${body}.${signature}`;
}

/* ------------------------------------------------------------------ */

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const errorParam = searchParams.get('error');

  // Parse redirect from state
  let redirect = '/dashboard';
  if (stateRaw) {
    try {
      const parsed = JSON.parse(Buffer.from(stateRaw, 'base64url').toString());
      if (parsed.redirect) redirect = parsed.redirect;
    } catch {
      // ignore bad state
    }
  }

  const origin = process.env.NEXT_PUBLIC_SERVER_URL || req.nextUrl.origin;
  const errorUrl = (msg: string) =>
    `${origin}/ar/login?error=${encodeURIComponent(msg)}`;

  if (errorParam) {
    return NextResponse.redirect(errorUrl(errorParam));
  }

  if (!code) {
    return NextResponse.redirect(errorUrl('missing_code'));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const payloadSecret = process.env.PAYLOAD_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(errorUrl('google_not_configured'));
  }

  if (!payloadSecret) {
    return NextResponse.redirect(errorUrl('server_misconfigured'));
  }

  // 1. Exchange code for tokens
  const callbackUrl = `${origin}/api/auth/google/callback`;

  let tokens: GoogleTokenResponse;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('[google-callback] Token exchange failed:', await tokenRes.text());
      return NextResponse.redirect(errorUrl('token_exchange_failed'));
    }

    tokens = await tokenRes.json();
  } catch (err) {
    console.error('[google-callback] Token exchange error:', err);
    return NextResponse.redirect(errorUrl('token_exchange_error'));
  }

  // 2. Fetch user info
  let googleUser: GoogleUserInfo;
  try {
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!infoRes.ok) {
      return NextResponse.redirect(errorUrl('userinfo_failed'));
    }

    googleUser = await infoRes.json();
  } catch (err) {
    console.error('[google-callback] UserInfo error:', err);
    return NextResponse.redirect(errorUrl('userinfo_error'));
  }

  // 3. Find or create user in Payload
  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: googleUser.email } },
    limit: 1,
    showHiddenFields: true,
  });

  let userId: string;

  if (existing.docs.length > 0) {
    const user = existing.docs[0];
    userId = String(user.id);

    const updateData: Record<string, unknown> = {};
    if (!user.googleId) updateData.googleId = googleUser.sub;
    if (!user.emailVerified) updateData.emailVerified = true;

    if (Object.keys(updateData).length > 0) {
      await payload.update({
        collection: 'users',
        id: userId,
        data: updateData,
      });
    }
  } else {
    // Create a new user — random password (they'll use Google to login)
    const randomPwd = `G!${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}Aa1`;

    const newUser = await payload.create({
      collection: 'users',
      overrideAccess: true,
      draft: false,
      data: {
        email: googleUser.email,
        firstName: googleUser.given_name || googleUser.name || '',
        lastName: googleUser.family_name || '',
        password: randomPwd,
        role: 'user' as const,
        emailVerified: true,
        googleId: googleUser.sub,
        preferredLanguage: 'ar' as const,
      },
    });

    userId = String(newUser.id);
  }

  // 4. Generate a Payload-compatible JWT token (HS256)
  const tokenExpiry = 60 * 60 * 24 * 7; // 7 days
  const token = signJwt(
    {
      id: userId,
      email: googleUser.email,
      collection: 'users',
    },
    payloadSecret,
    tokenExpiry,
  );

  // 5. Redirect to target with payload-token cookie
  const safeRedirect = redirect.startsWith('/') ? redirect : '/dashboard';
  const finalUrl = `${origin}/ar${safeRedirect}`;

  const response = NextResponse.redirect(finalUrl);

  response.cookies.set('payload-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
    maxAge: tokenExpiry,
  });

  return response;
}
