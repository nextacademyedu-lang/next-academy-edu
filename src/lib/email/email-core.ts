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

import * as React from 'react';
import { render } from '@react-email/components';
import { CorporateEmail } from './components/corporate-email';

// ─── Shared Layout ───────────────────────────────────────────────────────────

export async function buildEmailLayout(content: EmailContent, options: LayoutOptions = {}): Promise<string> {
  // We use React Email to generate beautiful, corporate, responsive HTML.
  const element = React.createElement(CorporateEmail, { content, options });
  const html = await render(element);
  return html;
}

// ─── Low-level send ──────────────────────────────────────────────────────────

export interface SendOptions {
  replyTo?: string;
}

export async function send(
  to: string,
  subject: string,
  html: string,
  options: SendOptions = {},
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY not set — skipping:', { to, subject });
    return;
  }

  const replyTo =
    typeof options.replyTo === 'string' && options.replyTo.trim()
      ? options.replyTo.trim()
      : undefined;

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const payload = await res.json().catch(() => null);

  if (!res.ok || payload?.error) {
    const message =
      (payload && typeof payload.error?.message === 'string' && payload.error.message) ||
      (payload && typeof payload.message === 'string' && payload.message) ||
      `HTTP ${res.status}`;
    throw new Error(`[email] Failed to send "${subject}" to ${to}: ${message}`);
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

export function greeting(name: string, locale: Locale = 'ar'): string {
  return locale === 'ar' ? `أهلاً ${name}،` : `Hi ${name},`;
}
