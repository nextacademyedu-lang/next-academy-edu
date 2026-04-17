import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens, getUserAuthClient } from '../../../../lib/google-auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/en/instructors/dashboard?error=google_auth_failed', req.url));
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const userId = state;
    
    // 1. Exchange for tokens
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      // If we don't get a refresh token, it means they already authorized this app previously
      // and we lost the refresh token. We'll still save what we have, but Google expects us
      // to force consent by revoking access to get a *new* refresh token. 
      // For now, we will handle it gracefully if they already have one, but log it.
      console.warn(`[User OAuth] No refresh token received for user ${userId}. They may need to revoke app permissions to reconnect.`);
    }

    // 2. Fetch the user's Google Email to store for display matching
    const oauth2Client = getUserAuthClient(tokens.refresh_token);
    let googleEmail = '';
    
    if (oauth2Client) {
      oauth2Client.setCredentials(tokens);
      try {
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const userInfo = await oauth2.userinfo.get();
        if (userInfo.data.email) {
          googleEmail = userInfo.data.email;
        }
      } catch (err) {
        console.error('[User OAuth] Failed to fetch Google user info:', err);
      }
    }

    const payload = await getPayload({ config });

    // 3. Update the user record
    const updateData: Record<string, unknown> = {
      googleAccessToken: tokens.access_token,
      googleCalendarConnectedAt: new Date().toISOString(),
    };

    if (tokens.refresh_token) {
      updateData.googleRefreshToken = tokens.refresh_token;
    }
    
    if (googleEmail) {
      updateData.googleCalendarEmail = googleEmail;
    }

    await payload.update({
      collection: 'users',
      id: userId,
      data: updateData,
      overrideAccess: true, // We are doing this system-side during OAuth callback
    });

    // 4. Redirect them back to their Dashboard context
    // Ideally we inspect the cookies or locale to know the right path.
    // Defaulting to English since it's an internal route that will 302 next.
    return NextResponse.redirect(new URL('/en/dashboard', req.url));
    
  } catch (error) {
    console.error('[User Google Callback Error]', error);
    return NextResponse.redirect(new URL('/en/dashboard?error=google_auth_failed', req.url));
  }
}
