import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import crypto from 'node:crypto';
import { sendOtpVerificationCode } from '@/lib/email';
import { asPayloadRequest } from '@/lib/payload-request';

// Simple in-memory rate limiter (per-process)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 3;
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(email);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

function generateOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit check
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Please wait before trying again.' },
        { status: 429 },
      );
    }

    const payload = await getPayload({ config });

    // Verify user exists
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
      overrideAccess: true,
      req: asPayloadRequest(request),
    });

    if (users.docs.length === 0) {
      // Don't reveal if email exists — but still return success
      return NextResponse.json(
        { message: 'If an account exists, a verification code has been sent.' },
        { status: 200 },
      );
    }

    const user = users.docs[0];

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email is already verified.' },
        { status: 200 },
      );
    }

    // Invalidate any existing unused codes for this email
    const existingCodes = await payload.find({
      collection: 'verification-codes',
      where: {
        and: [
          { email: { equals: normalizedEmail } },
          { used: { equals: false } },
          { type: { equals: 'email_verification' } },
        ],
      },
      overrideAccess: true,
      req: asPayloadRequest(request),
    });

    for (const code of existingCodes.docs) {
      await payload.update({
        collection: 'verification-codes',
        id: code.id,
        data: { used: true },
        overrideAccess: true,
        req: asPayloadRequest(request),
      });
    }

    // Generate and store OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await payload.create({
      collection: 'verification-codes',
      data: {
        email: normalizedEmail,
        code: otp,
        expiresAt: expiresAt.toISOString(),
        used: false,
        type: 'email_verification',
      },
      overrideAccess: true,
      req: asPayloadRequest(request),
    });

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 },
      );
    }

    const firstName = user.firstName || '';
    const preferredLanguage = user.preferredLanguage === 'en' ? 'en' : 'ar';

    await sendOtpVerificationCode({
      to: normalizedEmail,
      userName: firstName || normalizedEmail,
      code: otp,
      locale: preferredLanguage,
    });

    return NextResponse.json(
      { message: 'Verification code sent successfully.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 },
    );
  }
}
