/**
 * GET /api/google/connect
 *
 * Redirects admin to Google consent screen for Calendar API authorization.
 * Only accessible by admin users.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { getAuthUrl } from '@/lib/google-auth.ts';

export async function GET(req: NextRequest) {
  // Verify admin user
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });

  if (!user || (user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (err) {
    console.error('[google/connect] Error:', err);
    return NextResponse.json(
      { error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.' },
      { status: 500 },
    );
  }
}
