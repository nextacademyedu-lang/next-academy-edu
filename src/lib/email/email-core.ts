/**
 * Email Core — shared config, types, layout builder, and send utility.
 * All domain email modules import from here.
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const RESEND_API = 'https://api.resend.com/emails';
const FROM = process.env.RESEND_FROM_EMAIL || 'Next Academy <noreply@nextacademyedu.com>';
export const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
const LOGO_URL = () => `${APP_URL()}/logo.png`;
export const SUPPORT_EMAIL = 'support@nextacademyedu.com';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Locale = 'ar' | 'en';

export interface EmailContent {
  title: string;
  body: string;
  /** Optional CTA button */
  cta?: { text: string; url: string };
  /** Optional info box rows: [label, value][] */
  infoBox?: [string, string][];
  /** Optional warning/alert text */
  alert?: string;
}

export interface LayoutOptions {
  locale?: Locale;
  /** Show unsubscribe link (for engagement emails) */
  showUnsubscribe?: boolean;
}

// ─── Shared Layout ───────────────────────────────────────────────────────────

export function buildEmailLayout(content: EmailContent, options: LayoutOptions = {}): string {
  const locale = options.locale || 'ar';
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const year = new Date().getFullYear();

  const infoBoxHtml = content.infoBox
    ? `<div style="background:#1a1a1a;border-radius:8px;padding:16px;margin:20px 0">
        ${content.infoBox.map(([label, value]) => `<p style="margin:6px 0;font-size:14px;color:#C5C5C5"><strong style="color:#F1F6F1">${label}:</strong> ${value}</p>`).join('')}
       </div>`
    : '';

  const alertHtml = content.alert
    ? `<div style="background:#2a1a1a;border:1px solid #C51B1B;border-radius:8px;padding:14px;margin:20px 0">
        <p style="margin:0;color:#ff6b6b;font-size:14px"><strong>⚠️ ${content.alert}</strong></p>
       </div>`
    : '';

  const ctaHtml = content.cta
    ? `<div style="text-align:center;margin:28px 0">
        <a href="${content.cta.url}" style="background:#C51B1B;color:#FFF;padding:14px 40px;text-decoration:none;border-radius:4px;font-weight:700;display:inline-block;font-size:16px">${content.cta.text}</a>
       </div>`
    : '';

  const unsubscribeHtml = options.showUnsubscribe
    ? `<p style="margin:8px 0"><a href="${APP_URL()}/${locale}/unsubscribe" style="color:#666;text-decoration:underline;font-size:12px">${locale === 'ar' ? 'إلغاء الاشتراك' : 'Unsubscribe'}</a></p>`
    : '';

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background:#020504;color:#F1F6F1;font-family:Cairo,Arial,sans-serif;margin:0;padding:0">
  <div style="text-align:center;padding:32px 16px 16px">
    <img src="${LOGO_URL()}" alt="Next Academy" width="150" style="max-width:150px" />
  </div>
  <div style="max-width:600px;margin:0 auto;padding:32px;background:#111111;border-radius:8px">
    <h1 style="font-size:24px;margin:0 0 16px;color:#F1F6F1">${content.title}</h1>
    <div style="font-size:16px;line-height:1.7;color:#C5C5C5">${content.body}</div>
    ${infoBoxHtml}
    ${alertHtml}
    ${ctaHtml}
  </div>
  <div style="text-align:center;padding:24px 16px;color:#666;font-size:12px">
    <p style="margin:4px 0">Next Academy — ${year}</p>
    <p style="margin:4px 0"><a href="mailto:${SUPPORT_EMAIL}" style="color:#666">${SUPPORT_EMAIL}</a></p>
    ${unsubscribeHtml}
  </div>
</body>
</html>`;
}

// ─── Low-level send ──────────────────────────────────────────────────────────

export async function send(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set — skipping:', { to, subject });
    return;
  }

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[email] Failed to send:', err);
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

export function greeting(name: string, locale: Locale = 'ar'): string {
  return locale === 'ar' ? `أهلاً ${name}،` : `Hi ${name},`;
}
