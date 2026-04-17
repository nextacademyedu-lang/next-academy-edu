import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '../../../../../lib/google-auth';
import { getPayload } from 'payload';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    // Using Payload's Auth to determine the current user
    const { user } = await payload.auth({ headers: req.headers as any });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'instructor' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only instructors can connect Google Calendar' }, { status: 403 });
    }

    // We pass the user ID in the state parameter to reliably identify the user in the callback
    const url = getAuthUrl(String(user.id));
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('[User Google Connect Error]', error);
    return NextResponse.json({ error: 'Failed to initiate Google connection' }, { status: 500 });
  }
}
