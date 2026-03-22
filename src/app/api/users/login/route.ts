import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { rateLimit } from '@/lib/rate-limit';

// 10 requests per minute per IP, then lockout
const LIMIT = 10;
const WINDOW_MS = 60_000;

function parseConfiguredAdminEmails(): string[] {
  const raw = process.env.PAYLOAD_ADMIN_EMAIL || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function syncConfiguredAdminBeforeLogin(payload: any, email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmails = parseConfiguredAdminEmails();
  if (!normalizedEmail || adminEmails.length === 0 || !adminEmails.includes(normalizedEmail)) {
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

    const payload = await getPayload({ config });
    await syncConfiguredAdminBeforeLogin(payload, email);
    const result = await payload.login({
      collection: 'users',
      data: { email: email as string, password: password as string },
      req: req as any,
    });

    const response = NextResponse.json(result, { status: 200 });
    response.headers.set('X-RateLimit-Remaining', String(remaining));

    // Set the auth cookie from Payload's response
    if (result.token) {
      response.cookies.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7200, // 2 hours
      });
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
