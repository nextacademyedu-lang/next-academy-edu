/**
 * ONE-TIME admin seed endpoint.
 * POST /api/seed-admin
 * Body: { email, password, firstName, lastName, secret }
 * 
 * The `secret` must match PAYLOAD_SECRET to prevent unauthorized use.
 * DELETE THIS FILE after the first admin is created.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, secret } = body;

    // Validate secret matches PAYLOAD_SECRET
    if (!secret || secret !== process.env.PAYLOAD_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName' },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });

    // Check if user exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      // User exists — update role to admin and reset password
      const user = existing.docs[0];
      await payload.update({
        collection: 'users',
        id: user.id,
        data: {
          role: 'admin',
          password, // Payload will hash it
          firstName,
          lastName,
        },
      });
      return NextResponse.json({
        success: true,
        message: `User ${email} promoted to admin and password reset.`,
        userId: user.id,
      });
    } else {
      // Create new admin user
      const newUser = await payload.create({
        collection: 'users',
        data: {
          email,
          password,
          firstName,
          lastName,
          role: 'admin',
          emailVerified: true,
        },
      });
      return NextResponse.json({
        success: true,
        message: `Admin user ${email} created.`,
        userId: newUser.id,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
