/**
 * GET /api/auth/google
 *
 * Redirects the browser to Google OAuth 2.0 consent screen.
 * Accepts an optional ?redirect query-param that is forwarded through
 * the OAuth state so the callback can redirect the user where intended.
 */
import { NextRequest, NextResponse } from 'next/server';

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

  const callbackUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || req.nextUrl.origin}/api/auth/google/callback`;

  // state = base-64 encoded JSON so we can pass the redirect target
  const state = Buffer.from(JSON.stringify({ redirect })).toString('base64url');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(googleOAuthUrl);
}
