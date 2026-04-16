import { NextRequest, NextResponse } from 'next/server';
import { getPayload, type Payload } from 'payload';
import config from '@payload-config';
import { rateLimit } from '@/lib/rate-limit';
import { asPayloadRequest } from '@/lib/payload-request';

// 5 requests per minute per IP.
const LIMIT = 5;
const WINDOW_MS = 60_000;
// Defense-in-depth: limit attempts against the same email across IPs.
const EMAIL_LIMIT = 8;
const EMAIL_WINDOW_MS = 10 * 60_000;

function parseConfiguredAdminEmails(): string[] {
  const raw = process.env.PAYLOAD_ADMIN_EMAIL || '';
  return raw
    .split(/[,\s;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isConfiguredAdminEmail(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;
  return parseConfiguredAdminEmails().includes(normalizedEmail);
}

function resolveCookieDomain(hostname: string): string | undefined {
  if (hostname === 'nextacademyedu.com' || hostname.endsWith('.nextacademyedu.com')) {
    return '.nextacademyedu.com';
  }

  return undefined;
}

async function syncConfiguredAdminBeforeLogin(payload: Payload, email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isConfiguredAdminEmail(normalizedEmail)) {
    return;
  }

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: normalizedEmail } },
    limit: 1,
    overrideAccess: true,
  });

  if (!existing.docs?.length) return;
  const user = existing.docs[0];
  const shouldPromote = user.role !== 'admin';
  const shouldVerifyEmail = user.emailVerified !== true;
  if (!shouldPromote && !shouldVerifyEmail) return;

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      role: 'admin',
      emailVerified: true,
    },
    overrideAccess: true,
    context: { allowPrivilegedRoleWrite: true },
  });
}

async function ensureConfiguredAdminAfterLogin(params: {
  payload: Payload;
  result: any;
  email: string;
  password: string;
  req: NextRequest;
}): Promise<any> {
  const { payload, result, email, password, req } = params;
  if (!isConfiguredAdminEmail(email)) return result;

  const loggedInUser = result?.user;
  const userId = loggedInUser?.id;
  if (!userId) return result;

  const alreadyAdmin = loggedInUser?.role === 'admin';
  const alreadyVerified = loggedInUser?.emailVerified === true;
  if (alreadyAdmin && alreadyVerified) return result;

  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      role: 'admin',
      emailVerified: true,
    },
    overrideAccess: true,
    context: { allowPrivilegedRoleWrite: true },
  });

  // Re-login to issue a fresh token that contains the up-to-date admin role.
  const refreshed = await payload.login({
    collection: 'users',
    data: { email, password },
    req: req as any,
  });

  return refreshed;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous';

  const { success, remaining, resetInMs } = await rateLimit(`login:${ip}`, LIMIT, WINDOW_MS);

  if (!success) {
    return NextResponse.json(
      { errors: [{ message: 'محاولات كثيرة. حاول بعد دقيقة.' }] },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(resetInMs / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  try {
    // Parse body — Payload CMS admin sends multipart/form-data with a _payload field,
    // while external API consumers may send application/json.
    let email: string | undefined;
    let password: string | undefined;

    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const payloadField = formData.get('_payload');
      if (typeof payloadField === 'string') {
        const parsed = JSON.parse(payloadField);
        email = parsed.email;
        password = parsed.password;
      }
    } else {
      const body = await req.json();
      email = body.email;
      password = body.password;
    }

    if (!email || !password) {
      return NextResponse.json(
        { errors: [{ message: 'البريد الإلكتروني وكلمة المرور مطلوبان.' }] },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const emailLimitResult = await rateLimit(
      `login:email:${normalizedEmail}`,
      EMAIL_LIMIT,
      EMAIL_WINDOW_MS,
    );
    if (!emailLimitResult.success) {
      return NextResponse.json(
        { errors: [{ message: 'محاولات كثيرة. حاول لاحقًا.' }] },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(emailLimitResult.resetInMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const payload = await getPayload({ config });
    await syncConfiguredAdminBeforeLogin(payload, normalizedEmail);
    let result = await payload.login({
      collection: 'users',
      data: { email: normalizedEmail as string, password: password as string },
      req: asPayloadRequest(req),
    });
    result = await ensureConfiguredAdminAfterLogin({
      payload,
      result,
      email: normalizedEmail,
      password: password as string,
      req,
    });

    const response = NextResponse.json(result, { status: 200 });
    response.headers.set('X-RateLimit-Remaining', String(remaining));

    // Set the auth cookie from Payload's response
    if (result.token) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7200, // 2 hours
      } as const;

      // Host-only cookie (covers current host and avoids stale host cookie conflicts).
      response.cookies.set('payload-token', result.token, cookieOptions);

      // Cross-subdomain cookie for apex/www consistency.
      const rootDomain = resolveCookieDomain(req.nextUrl.hostname);
      if (rootDomain) {
        response.cookies.set('payload-token', result.token, {
          ...cookieOptions,
          domain: rootDomain,
        });
      }
    }

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '';
    const isAuthError =
      message.includes('credentials') ||
      message.includes('locked') ||
      message.includes('The email or password') ||
      message.includes('not verified');

    if (isAuthError) {
      return NextResponse.json(
        { errors: [{ message: 'بيانات الدخول غير صحيحة.' }] },
        { status: 401 },
      );
    }

    // Unexpected error — log it so admins can debug
    console.error('[login] Unexpected error:', err);
    return NextResponse.json(
      { errors: [{ message: 'حدث خطأ في السيرفر. حاول مرة أخرى.' }] },
      { status: 500 },
    );
  }
}
