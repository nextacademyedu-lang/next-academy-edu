/**
 * Google OAuth2 Authentication
 *
 * Modified to support dynamic per-user refresh tokens for Native Booking Engine.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI
 */

import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

function getCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing Google OAuth credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.',
    );
  }

  return { clientId, clientSecret, redirectUri };
}

/** Create a fresh OAuth2 client (no tokens set) */
export function createOAuth2Client() {
  const { clientId, clientSecret, redirectUri } = getCredentials();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/** Get the Google consent URL for a user to authorize */
export function getAuthUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state, // Pass user intent or user ID
  });
}

/** Exchange an authorization code for tokens */
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Get an authenticated Google OAuth2 client using a specific refresh token.
 */
export function getUserAuthClient(refreshToken: string | null | undefined) {
  if (!refreshToken) return null;

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

/** Get an authenticated Google OAuth2 client using the global admin refresh token. */
export function getAdminAuthClient() {
  return getUserAuthClient(process.env.GOOGLE_REFRESH_TOKEN);
}

/** Check if Google Calendar integration is structurally configured globally */
export function isGoogleCalendarEnabled(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
}
