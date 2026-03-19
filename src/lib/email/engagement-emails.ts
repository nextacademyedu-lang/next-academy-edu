/**
 * Engagement email templates — 6 functions.
 *
 * Uses buildEmailLayout + send from email-core and i18n from email-dictionary.
 */

import { buildEmailLayout, send, APP_URL, greeting } from './email-core';
import { t } from './email-dictionary';
import type { Locale } from './email-core';

// ─── 1. Consultation Confirmed ──────────────────────────────────────────────

export async function sendConsultationConfirmed(data: {
  to: string;
  userName: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).consultationConfirmed;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.instructor)}`,
    infoBox: [
      [s.labelConsultant, data.instructor],
      [s.labelDate, data.date],
      [s.labelTime, data.time],
      [s.labelDuration, data.duration],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/consultations` },
  }, { locale });
  await send(data.to, s.subject(data.instructor), html);
}

// ─── 2. Consultation Reminder 24h ───────────────────────────────────────────

export async function sendConsultationReminder24h(data: {
  to: string;
  userName: string;
  instructor: string;
  time: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).consultationReminder24h;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.instructor, data.time)}`,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/consultations` },
  }, { locale });
  await send(data.to, s.subject(data.time), html);
}

// ─── 3. Consultation Reminder 1h ────────────────────────────────────────────

export async function sendConsultationReminder1h(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).consultationReminder1h;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/consultations` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 4. Consultation Cancelled ──────────────────────────────────────────────

export async function sendConsultationCancelled(data: {
  to: string;
  userName: string;
  instructor: string;
  date: string;
  reason: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).consultationCancelled;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.instructor, data.date)}`,
    infoBox: [
      [s.labelReason, data.reason],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/consultations` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 5. Inactive User ──────────────────────────────────────────────────────

export async function sendInactiveUser(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).inactiveUser;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    cta: { text: s.cta, url: `${APP_URL()}/programs` },
  }, { locale, showUnsubscribe: true });
  await send(data.to, s.subject, html);
}

// ─── 6. New Program Announcement ────────────────────────────────────────────

export async function sendNewProgramAnnouncement(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).newProgramAnnouncement;
  const html = buildEmailLayout({
    title: s.title(data.programTitle),
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    cta: { text: s.cta, url: `${APP_URL()}/programs` },
  }, { locale, showUnsubscribe: true });
  await send(data.to, s.subject(data.programTitle), html);
}
