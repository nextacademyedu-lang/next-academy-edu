import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { assertTrustedWriteRequest } from '@/lib/csrf';

type UnsubscribeBody = {
  email?: unknown;
};

function sanitizeEmail(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    const body = (await req.json().catch(() => null)) as UnsubscribeBody | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const email = sanitizeEmail(body.email);
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const users = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
      depth: 0,
      limit: 10,
      overrideAccess: true,
      req: req as any,
    });

    for (const user of users.docs) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          newsletterOptIn: false,
          whatsappOptIn: false,
        },
        overrideAccess: true,
        req: req as any,
      });
    }

    // Return success even if no user is found to avoid email enumeration.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/unsubscribe][POST]', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
