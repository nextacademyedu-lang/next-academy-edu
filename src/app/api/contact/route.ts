import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { assertTrustedWriteRequest } from '@/lib/csrf';

type ContactBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function sanitizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveContactRecipient(): string | null {
  const explicit =
    process.env.CONTACT_FORM_TO ||
    process.env.SUPPORT_EMAIL ||
    process.env.PAYLOAD_ADMIN_EMAIL ||
    '';

  const first = explicit
    .split(/[,\s;]+/)
    .map((email) => email.trim())
    .filter(Boolean)[0];

  return first || null;
}

export async function POST(req: NextRequest) {
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    const body = (await req.json().catch(() => null)) as ContactBody | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email).toLowerCase();
    const subject = sanitizeText(body.subject);
    const message = sanitizeText(body.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const to = resolveContactRecipient();
    if (!to) {
      console.error('[api/contact][POST] Missing CONTACT_FORM_TO / SUPPORT_EMAIL / PAYLOAD_ADMIN_EMAIL');
      return NextResponse.json({ error: 'Contact email is not configured' }, { status: 500 });
    }

    const payload = await getPayload({ config });
    await payload.sendEmail({
      to,
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; color: #111827;">
          <h2 style="margin-bottom: 16px;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
          <p style="white-space: pre-wrap; line-height: 1.7;">${message}</p>
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
    });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('[api/contact][POST]', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
