import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { rateLimit } from '@/lib/rate-limit';
import { asPayloadRequest } from '@/lib/payload-request';
import {
  findInstructorIdByEmail,
  linkUserToInstructor,
  normalizeEmail,
} from '@/lib/instructor-account-link';

const VERIFY_LIMIT = 5;
const VERIFY_WINDOW_MS = 15 * 60 * 1000;

function buildSlugBase(parts: Array<string | undefined | null>): string {
  const joined = parts
    .map((part) => (typeof part === 'string' ? part.trim().toLowerCase() : ''))
    .filter(Boolean)
    .join('-');

  const normalized = joined
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'instructor';
}

async function buildUniqueInstructorSlug(params: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  req: NextRequest;
  base: string;
  userId: string | number;
}): Promise<string> {
  const { payload, req, base, userId } = params;
  const safeBase = base || `instructor-${userId}`;

  for (let i = 0; i < 100; i += 1) {
    const candidate = i === 0 ? safeBase : `${safeBase}-${i + 1}`;
    const existing = await payload.find({
      collection: 'instructors',
      where: { slug: { equals: candidate } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
          });

    if (existing.docs.length === 0) return candidate;
  }

  return `instructor-${userId}-${Date.now()}`;
}

async function ensureInstructorAccountForIntent(params: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  req: NextRequest;
  user: {
    id: number | string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
    emailVerified?: boolean | null;
    instructorId?: unknown;
    signupIntent?: string | null;
  };
}): Promise<void> {
  const { payload, req, user } = params;
  if (user.signupIntent !== 'instructor') return;

  const normalizedEmail = normalizeEmail(user.email);
  if (!normalizedEmail) return;

  const instructorLookup = await findInstructorIdByEmail({
    payload,
    req,
    normalizedEmail,
    source: 'verify-otp',
  });

  if (instructorLookup.status === 'duplicate') {
    console.warn(
      `[verify-otp] Multiple instructor profiles share email "${normalizedEmail}". Instructor auto-link skipped for user #${user.id}.`,
    );
    return;
  }

  let instructorId =
    instructorLookup.status === 'found' ? instructorLookup.instructorId : null;

  if (instructorId === null) {
    const firstName = (user.firstName || '').trim() || 'New';
    const lastName = (user.lastName || '').trim() || 'Instructor';
    const baseSlug = buildSlugBase([user.firstName, user.lastName, String(user.id)]);
    const slug = await buildUniqueInstructorSlug({
      payload,
      req,
      base: baseSlug,
      userId: user.id,
    });

    const created = await payload.create({
      collection: 'instructors',
      data: {
        firstName,
        lastName,
        slug,
        email: normalizedEmail,
        isActive: false,
        verificationStatus: 'draft',
      },
      overrideAccess: true,
      req: asPayloadRequest(req),
      context: { skipInstructorAutoLink: true, selfServiceInstructorProfile: true },
    });

    instructorId = created.id as number | string;
  }

  await linkUserToInstructor({
    payload,
    req,
    user,
    instructorId,
    source: 'verify-otp',
  });
}

async function ensureB2BManagerAccountForIntent(params: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  req: NextRequest;
  user: {
    id: number | string;
    role?: string | null;
    signupIntent?: string | null;
  };
}) {
  const { payload, req, user } = params;
  if (user.signupIntent !== 'b2b_manager') return user;
  if (user.role === 'b2b_manager') return user;

  const updated = await payload.update({
    collection: 'users',
    id: user.id,
    data: { role: 'b2b_manager' },
    overrideAccess: true,
    req: asPayloadRequest(req),
    context: { allowPrivilegedRoleWrite: true },
  });

  return updated as {
    id: number | string;
    role?: string | null;
    signupIntent?: string | null;
  };
}

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
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      request.headers.get('x-real-ip') ??
      'anonymous';

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 },
      );
    }

    const {
      success: verifyAllowed,
      remaining,
      resetInMs,
    } = await rateLimit(`verify-otp:${normalizedEmail}:${ip}`, VERIFY_LIMIT, VERIFY_WINDOW_MS);

    if (!verifyAllowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(resetInMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
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
      overrideAccess: true,
      req: asPayloadRequest(request),
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
      overrideAccess: true,
      req: asPayloadRequest(request),
    });

    // Find and update user's emailVerified status
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
      overrideAccess: true,
      req: asPayloadRequest(request),
    });

    if (users.docs.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: users.docs[0].id,
      data: { emailVerified: true },
      overrideAccess: true,
      req: asPayloadRequest(request),
    });

    // ── Intent-based role assignment (with retry) ─────────────────────
    // Email is already verified at this point. If the instructor/b2b
    // account provisioning fails, we retry up to 3 times before giving up.
    let roleAssigned = true;
    const MAX_ROLE_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_ROLE_RETRIES; attempt++) {
      try {
        const intentAdjustedUser = await ensureB2BManagerAccountForIntent({
          payload,
          req: request,
          user: updatedUser as {
            id: number | string;
            role?: string | null;
            signupIntent?: string | null;
          },
        });

        await ensureInstructorAccountForIntent({
          payload,
          req: request,
          user: intentAdjustedUser as {
            id: number | string;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            role?: string | null;
            emailVerified?: boolean | null;
            instructorId?: unknown;
            signupIntent?: string | null;
          },
        });
        break; // success — exit retry loop
      } catch (roleErr) {
        console.error(
          `[verify-otp] Role assignment attempt ${attempt}/${MAX_ROLE_RETRIES} failed:`,
          roleErr,
        );
        if (attempt === MAX_ROLE_RETRIES) {
          roleAssigned = false;
          console.error('[verify-otp] Role assignment EXHAUSTED all retries (email IS verified)');
        } else {
          // Wait 1s before retrying
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    return NextResponse.json(
      { verified: true, message: 'Email verified successfully', roleAssigned },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        },
      },
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 },
    );
  }
}
