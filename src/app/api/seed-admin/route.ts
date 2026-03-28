/**
 * Emergency admin seed endpoint.
 *
 * POST /api/seed-admin
 * Body: { email, password, firstName, lastName }
 *
 * Security:
 * - Disabled by default (ENABLE_ADMIN_SEED_ENDPOINT must be "true")
 * - Requires Authorization: Bearer <CRON_SECRET>
 */
import crypto from 'node:crypto';
import { getPayload } from 'payload';
import config from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  try {
    if (process.env.ENABLE_ADMIN_SEED_ENDPOINT !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const configuredSecret = process.env.CRON_SECRET?.trim();
    if (!configuredSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured' },
        { status: 503 },
      );
    }

    const incomingAuth = req.headers.get('authorization') || '';
    const expectedAuth = `Bearer ${configuredSecret}`;
    if (!timingSafeEqualString(incomingAuth, expectedAuth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });

    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      const user = existing.docs[0];
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          role: 'admin',
          emailVerified: true,
          password,
          firstName,
          lastName,
        },
        overrideAccess: true,
        context: { allowPrivilegedRoleWrite: true },
      });

      return NextResponse.json({
        success: true,
        message: `User ${email} promoted to admin and password reset.`,
        userId: user.id,
      });
    }

    const newUser = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        firstName,
        lastName,
        role: 'admin',
        signupIntent: 'student',
        emailVerified: true,
      },
      overrideAccess: true,
      context: { allowPrivilegedRoleWrite: true },
    });

    return NextResponse.json({
      success: true,
      message: `Admin user ${email} created.`,
      userId: newUser.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
