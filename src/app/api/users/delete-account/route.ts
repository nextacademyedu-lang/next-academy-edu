import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { authenticateRequestUser } from '@/lib/server-auth';
import { asPayloadRequest } from '@/lib/payload-request';
import { sendAccountDeleted } from '@/lib/email';
import { cookies } from 'next/headers';

// Rate limit map (per-user)
const deleteAccountLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = deleteAccountLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    deleteAccountLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * DELETE /api/users/delete-account
 * 
 * Securely deletes the authenticated user's account after confirmation.
 * Follows GDPR/Law 151 compliance.
 */
export async function DELETE(request: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const user = await authenticateRequestUser(payload, request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    if (body.confirm !== 'DELETE') {
      return NextResponse.json(
        { error: 'Please type DELETE exactly to confirm.' }, 
        { status: 400 }
      );
    }

    // Send confirmation email BEFORE deletion
    // We do this while user record still exists and has its data
    await sendAccountDeleted({
      to: user.email,
      userName: user.firstName || user.email,
      locale: user.preferredLanguage === 'en' ? 'en' : 'ar',
    });

    // Delete account
    // Payload beforeDelete hooks handle associations cleanup (Bookings cascade, etc)
    await payload.delete({
      collection: 'users',
      id: user.id,
      req: asPayloadRequest(request),
    });

    // Clear session cookies
    const cookieStore = await cookies();
    cookieStore.delete('payload-token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account. Please try again.' },
      { status: 500 }
    );
  }
}
