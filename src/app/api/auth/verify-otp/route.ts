import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || typeof email !== 'string' || !code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config });

    // Find valid, unused, non-expired code
    const verificationCodes = await payload.find({
      collection: 'verification-codes',
      where: {
        and: [
          { email: { equals: normalizedEmail } },
          { code: { equals: normalizedCode } },
          { used: { equals: false } },
          { type: { equals: 'email_verification' } },
          { expiresAt: { greater_than: new Date().toISOString() } },
        ],
      },
      limit: 1,
      sort: '-createdAt',
    });

    if (verificationCodes.docs.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 },
      );
    }

    const verificationCode = verificationCodes.docs[0];

    // Mark code as used
    await payload.update({
      collection: 'verification-codes',
      id: verificationCode.id,
      data: { used: true },
    });

    // Find and update user's emailVerified status
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    });

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    await payload.update({
      collection: 'users',
      id: users.docs[0].id,
      data: { emailVerified: true },
    });

    return NextResponse.json(
      { verified: true, message: 'Email verified successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 },
    );
  }
}
