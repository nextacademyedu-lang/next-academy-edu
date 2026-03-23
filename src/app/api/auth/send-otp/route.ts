import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { Resend } from 'resend';
import crypto from 'node:crypto';

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
    });

    for (const code of existingCodes.docs) {
      await payload.update({
        collection: 'verification-codes',
        id: code.id,
        data: { used: true },
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
    });

    // Send OTP via Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const firstName = user.firstName || '';

    await resend.emails.send({
      from: `${process.env.RESEND_FROM_NAME || 'Next Academy'} <${process.env.RESEND_FROM_EMAIL || 'noreply@nextacademyedu.com'}>`,
      to: normalizedEmail,
      subject: 'Verify your email — Next Academy',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #0a0a0f; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #C9A96E; margin: 0;">Next Academy</h1>
          </div>
          <div style="background: #1a1a2e; border-radius: 12px; padding: 32px 24px; border: 1px solid rgba(201, 169, 110, 0.2);">
            <p style="color: #d4d4d8; font-size: 16px; margin: 0 0 8px;">Hi ${firstName},</p>
            <p style="color: #a1a1aa; font-size: 14px; margin: 0 0 24px;">Enter this code to verify your email address:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; background: linear-gradient(135deg, #C9A96E, #B8945A); color: #0a0a0f; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 16px 32px; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #71717a; font-size: 13px; text-align: center; margin: 16px 0 0;">This code expires in <strong>10 minutes</strong>.</p>
          </div>
          <p style="color: #52525b; font-size: 12px; text-align: center; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
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
