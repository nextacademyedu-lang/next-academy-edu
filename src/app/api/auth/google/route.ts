/**
 * GET /api/auth/google
 *
 * Redirects the browser to Google OAuth 2.0 consent screen.
 * Accepts an optional ?redirect query-param that is forwarded through
 * the OAuth state so the callback can redirect the user where intended.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

function createPkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured.' },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get('redirect') || '/dashboard';
  const nonce = crypto.randomUUID();
  const { codeVerifier, codeChallenge } = createPkcePair();

  const callbackUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || req.nextUrl.origin}/api/auth/google/callback`;

  // state carries redirect + one-time nonce to protect OAuth flow from CSRF/login CSRF.
  const state = Buffer.from(JSON.stringify({ redirect, nonce })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  const response = NextResponse.redirect(googleOAuthUrl);
  response.cookies.set('oauth-nonce', nonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    maxAge: 600, // 10 minutes
  });
  response.cookies.set('oauth-pkce', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    maxAge: 600,
  });
  return response;
}
