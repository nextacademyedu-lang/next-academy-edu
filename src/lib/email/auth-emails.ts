/**
 * Auth email templates — 8 functions.
 *
 * Uses buildEmailLayout + send from email-core and i18n from email-dictionary.
 */

import { buildEmailLayout, send, APP_URL, greeting } from './email-core';
import { t } from './email-dictionary';
import type { Locale } from './email-core';

// ─── 0. OTP Verification Code ───────────────────────────────────────────────

export async function sendOtpVerificationCode(data: {
  to: string;
  userName: string;
  code: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const subject = locale === 'ar'
    ? 'رمز التحقق الخاص بك — نيكست أكاديمي'
    : 'Your verification code — Next Academy';
  const title = locale === 'ar'
    ? 'تأكيد البريد الإلكتروني'
    : 'Verify your email address';
  const body = locale === 'ar'
    ? `${greeting(data.userName, locale)}\n\nاستخدم الرمز التالي لإكمال تأكيد البريد الإلكتروني:`
    : `${greeting(data.userName, locale)}\n\nUse this code to complete email verification:`;

  const html = buildEmailLayout(
    {
      title,
      body,
      infoBox: [[locale === 'ar' ? 'رمز التحقق' : 'Verification code', data.code]],
      alert: locale === 'ar'
        ? 'هذا الرمز صالح لمدة 10 دقائق فقط.'
        : 'This code is valid for 10 minutes only.',
    },
    { locale },
  );

  await send(data.to, subject, html);
}

// ─── 1. Welcome ──────────────────────────────────────────────────────────────

export async function sendWelcome(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).welcome;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    cta: { text: s.cta, url: `${APP_URL()}/programs` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 2. Email Verification ──────────────────────────────────────────────────

export async function sendEmailVerification(data: {
  to: string;
  userName: string;
  verificationUrl: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).emailVerification;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    cta: { text: s.cta, url: data.verificationUrl },
    alert: s.expiry,
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 3. Password Reset ─────────────────────────────────────────────────────

export async function sendPasswordReset(data: {
  to: string;
  userName: string;
  resetUrl: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).passwordReset;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}\n\n${s.ignore}`,
    cta: { text: s.cta, url: data.resetUrl },
    alert: s.expiry,
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 4. Account Deletion Confirmation ───────────────────────────────────────

export async function sendAccountDeletionConfirm(data: {
  to: string;
  userName: string;
  confirmUrl: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).accountDeletionConfirm;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}\n\n${s.ignore}`,
    cta: { text: s.cta, url: data.confirmUrl },
    alert: s.warning,
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 5. Account Deleted ─────────────────────────────────────────────────────

export async function sendAccountDeleted(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).accountDeleted;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}\n\n${s.contact}`,
    cta: { text: s.cta, url: APP_URL() },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 6. Email Changed ──────────────────────────────────────────────────────

export async function sendEmailChanged(data: {
  to: string;
  userName: string;
  newEmail: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).emailChanged;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.newEmail)}\n\n${s.notYou}`,
    cta: { text: s.cta, url: `${APP_URL()}/settings` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 7. Security Alert ─────────────────────────────────────────────────────

export async function sendSecurityAlert(data: {
  to: string;
  userName: string;
  action: string;
  device: string;
  ip: string;
  time: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).securityAlert;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}\n\n${s.notYou}`,
    infoBox: [
      [s.labelAction, data.action],
      [s.labelDevice, data.device],
      [s.labelIp, data.ip],
      [s.labelTime, data.time],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/settings/security` },
  }, { locale });
  await send(data.to, s.subject, html);
}
