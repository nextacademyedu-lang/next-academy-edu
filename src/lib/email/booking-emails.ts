/**
 * Booking email templates — 9 functions.
 *
 * Uses buildEmailLayout + send from email-core and i18n from email-dictionary.
 */

import { buildEmailLayout, send, APP_URL, greeting } from './email-core';
import { t } from './email-dictionary';
import type { Locale } from './email-core';

// ─── 1. Booking Confirmation ─────────────────────────────────────────────────

export async function sendBookingConfirmation(data: {
  to: string;
  userName: string;
  programTitle: string;
  bookingCode: string;
  amountPaid: number;
  startDate: string;
  locale?: Locale;
  location?: {
    type?: string;
    name?: string;
    address?: string;
  } | null;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).bookingConfirmation;
  const cur = t(locale).currency;

  const infoRows: [string, string][] = [
    [s.labelProgram, data.programTitle],
    [s.labelBookingCode, data.bookingCode],
    [s.labelAmountPaid, `${data.amountPaid} ${cur}`],
    [s.labelStartDate, data.startDate],
  ];

  // Add location info for in-person / hybrid programs
  if (data.location && data.location.type && data.location.type !== 'online') {
    const formatLabel =
      data.location.type === 'in-person'
        ? (locale === 'ar' ? '\u062d\u0636\u0648\u0631\u064a' : 'In-Person')
        : (locale === 'ar' ? '\u062d\u0636\u0648\u0631\u064a + \u0623\u0648\u0646\u0644\u0627\u064a\u0646' : 'Hybrid');
    infoRows.push([s.labelFormat, formatLabel]);
    if (data.location.name) {
      infoRows.push([s.labelLocation, data.location.name]);
    }
    if (data.location.address) {
      infoRows.push([s.labelAddress, data.location.address]);
    }
  }

  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    infoBox: infoRows,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/bookings` },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 2. Booking Cancelled ───────────────────────────────────────────────────

export async function sendBookingCancelled(data: {
  to: string;
  userName: string;
  programTitle: string;
  bookingCode: string;
  reason: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).bookingCancelled;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
      [s.labelBookingCode, data.bookingCode],
      [s.labelReason, data.reason],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/programs` },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 3. Round Cancelled ─────────────────────────────────────────────────────

export async function sendRoundCancelled(data: {
  to: string;
  userName: string;
  programTitle: string;
  date: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).roundCancelled;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle, data.date)}\n\n${s.alternatives}`,
    cta: { text: s.cta, url: `${APP_URL()}/programs` },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 4. Review Request ──────────────────────────────────────────────────────

export async function sendReviewRequest(data: {
  to: string;
  userName: string;
  programTitle: string;
  reviewUrl: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).reviewRequest;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    cta: { text: s.cta, url: data.reviewUrl },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 5. Review Reminder ─────────────────────────────────────────────────────

export async function sendReviewReminder(data: {
  to: string;
  userName: string;
  programTitle: string;
  reviewUrl: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).reviewReminder;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    cta: { text: s.cta, url: data.reviewUrl },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 6. Waitlist Spot Available ─────────────────────────────────────────────

export async function sendWaitlistSpotAvailable(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  expiresAt: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).waitlistSpotAvailable;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
      [s.labelExpires, data.expiresAt],
    ],
    alert: s.alert,
    cta: { text: s.cta, url: `${APP_URL()}/programs/${data.roundId}` },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 7. Certificate Ready ──────────────────────────────────────────────────

export async function sendCertificateReady(data: {
  to: string;
  userName: string;
  programTitle: string;
  certificateUrl: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).certificateReady;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    cta: { text: s.cta, url: data.certificateUrl },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 8. Round Reminder 3 Days ───────────────────────────────────────────────

export async function sendRoundReminder3d(data: {
  to: string;
  userName: string;
  programTitle: string;
  startDate: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).roundReminder3d;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle, data.startDate)}`,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard` },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}

// ─── 9. Round Reminder 1 Day ────────────────────────────────────────────────

export async function sendRoundReminder1d(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).roundReminder1d;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard` },
  }, { locale });
  await send(data.to, s.subject(data.programTitle), html);
}
