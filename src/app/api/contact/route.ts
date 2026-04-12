import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { assertTrustedWriteRequest } from '@/lib/csrf';
import { rateLimit } from '@/lib/rate-limit';
import {
  sendContactAutoReply,
  sendContactTeamNotification,
  type ContactScenario,
} from '@/lib/email/contact-emails';

type ContactBody = {
  locale?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  scenario?: unknown;
  preferredChannel?: unknown;
  preferredTime?: unknown;
  subject?: unknown;
  message?: unknown;
};

const CONTACT_SCENARIOS: ContactScenario[] = [
  'general_support',
  'sales_programs',
  'corporate_training',
  'partnerships',
  'complaint',
];
const PREFERRED_CHANNELS = ['email', 'phone', 'whatsapp'] as const;

const IP_LIMIT = 5;
const IP_WINDOW_MS = 60_000;
const EMAIL_LIMIT = 10;
const EMAIL_WINDOW_MS = 10 * 60_000;

type ApiLocale = 'ar' | 'en';

function sanitizeText(value: unknown, maxLength = 255): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 6 && digits.length <= 16;
}

function parseLocale(value: unknown): ApiLocale {
  return value === 'en' ? 'en' : 'ar';
}

function isContactScenario(value: string): value is ContactScenario {
  return CONTACT_SCENARIOS.includes(value as ContactScenario);
}

function parseScenario(value: unknown): ContactScenario {
  const candidate = sanitizeText(value, 64);
  return isContactScenario(candidate) ? candidate : 'general_support';
}

function parsePreferredChannel(value: unknown): string | null {
  const candidate = sanitizeText(value, 32).toLowerCase();
  if (!candidate) return null;
  return PREFERRED_CHANNELS.includes(candidate as (typeof PREFERRED_CHANNELS)[number])
    ? candidate
    : null;
}

function pick(locale: ApiLocale, ar: string, en: string): string {
  return locale === 'en' ? en : ar;
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: 'Website', lastName: 'Lead' };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '-' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'anonymous'
  );
}

function firstEmail(value: string): string | null {
  const first = value
    .split(/[,\s;]+/)
    .map((email) => email.trim())
    .find(Boolean);

  return first || null;
}

function resolveContactRecipient(scenario: ContactScenario): string | null {
  const scenarioRecipientByEnv: Record<ContactScenario, string | undefined> = {
    general_support: process.env.CONTACT_FORM_TO_GENERAL,
    sales_programs: process.env.CONTACT_FORM_TO_SALES,
    corporate_training: process.env.CONTACT_FORM_TO_CORPORATE,
    partnerships: process.env.CONTACT_FORM_TO_PARTNERSHIPS,
    complaint: process.env.CONTACT_FORM_TO_COMPLAINTS,
  };

  const configured =
    scenarioRecipientByEnv[scenario] ||
    process.env.CONTACT_FORM_TO ||
    process.env.SUPPORT_EMAIL ||
    process.env.PAYLOAD_ADMIN_EMAIL ||
    '';

  return firstEmail(configured);
}

function leadPriorityForScenario(scenario: ContactScenario): 'low' | 'medium' | 'high' | 'urgent' {
  switch (scenario) {
    case 'complaint':
      return 'high';
    case 'corporate_training':
    case 'partnerships':
      return 'urgent';
    case 'sales_programs':
      return 'medium';
    case 'general_support':
    default:
      return 'medium';
  }
}

export async function POST(req: NextRequest) {
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    const body = (await req.json().catch(() => null)) as ContactBody | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const locale = parseLocale(body.locale);
    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email).toLowerCase();
    const phone = sanitizeText(body.phone, 40);
    const company = sanitizeText(body.company, 160);
    const subject = sanitizeText(body.subject, 200);
    const message = sanitizeText(body.message, 4000);
    const preferredTime = sanitizeText(body.preferredTime, 120);
    const scenario = parseScenario(body.scenario);
    const preferredChannel = parsePreferredChannel(body.preferredChannel);

    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        {
          error: pick(
            locale,
            'الاسم والبريد ورقم الهاتف والرسالة حقول مطلوبة.',
            'Name, email, phone, and message are required.',
          ),
        },
        { status: 400 },
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: pick(locale, 'يرجى إدخال بريد إلكتروني صحيح.', 'Please enter a valid email address.') },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: pick(locale, 'يرجى إدخال رقم هاتف صحيح.', 'Please enter a valid phone number.') },
        { status: 400 },
      );
    }

    const ip = clientIp(req);
    const ipLimit = await rateLimit(`contact:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
    if (!ipLimit.success) {
      return NextResponse.json(
        { error: pick(locale, 'محاولات كثيرة. حاول بعد دقيقة.', 'Too many requests. Please try again in a minute.') },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(ipLimit.resetInMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const emailLimit = await rateLimit(`contact:email:${email}`, EMAIL_LIMIT, EMAIL_WINDOW_MS);
    if (!emailLimit.success) {
      return NextResponse.json(
        {
          error: pick(
            locale,
            'تم تجاوز عدد المحاولات لهذا البريد. حاول لاحقًا.',
            'Too many requests for this email. Please try later.',
          ),
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(emailLimit.resetInMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        },
      );
    }

    const to = resolveContactRecipient(scenario);
    if (!to) {
      console.error('[api/contact][POST] Missing CONTACT_FORM_TO / SUPPORT_EMAIL / PAYLOAD_ADMIN_EMAIL');
      return NextResponse.json(
        {
          error: pick(locale, 'إعدادات بريد التواصل غير مكتملة.', 'Contact email is not configured.'),
        },
        { status: 500 },
      );
    }

    const payload = await getPayload({ config });
    const leadName = splitName(name);
    const leadNotes = [
      `Scenario: ${scenario}`,
      `Preferred Channel: ${preferredChannel || '-'}`,
      `Preferred Time: ${preferredTime || '-'}`,
      `Subject: ${subject || '-'}`,
      '',
      message,
    ].join('\n');

    try {
      await payload.create({
        collection: 'leads',
        data: {
          firstName: leadName.firstName,
          lastName: leadName.lastName,
          email,
          phone,
          company: company || undefined,
          source: 'other',
          sourceDetails: `contact_form:${scenario}`,
          status: 'new',
          priority: leadPriorityForScenario(scenario),
          notes: leadNotes,
        },
        overrideAccess: true,
        req: req as any,
      });
    } catch (leadError) {
      console.error('[api/contact][POST] lead create failed (non-blocking):', leadError);
    }

    await sendContactTeamNotification({
      to,
      name,
      email,
      phone,
      company,
      subject,
      message,
      scenario,
      preferredChannel: preferredChannel || undefined,
      preferredTime: preferredTime || undefined,
      locale,
    });

    try {
      await sendContactAutoReply({
        to: email,
        name,
        scenario,
        locale,
      });
    } catch (autoReplyError) {
      console.error('[api/contact][POST] auto-reply failed (non-blocking):', autoReplyError);
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('[api/contact][POST]', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
