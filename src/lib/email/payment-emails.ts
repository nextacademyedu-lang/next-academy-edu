/**
 * Payment email templates — 9 functions.
 *
 * Uses buildEmailLayout + send from email-core and i18n from email-dictionary.
 */

import { buildEmailLayout, send, APP_URL, greeting } from './email-core';
import { t } from './email-dictionary';
import type { Locale } from './email-core';

// ─── 1. Payment Receipt ─────────────────────────────────────────────────────

export async function sendPaymentReceipt(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).paymentReceipt;
  const cur = t(locale).currency;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
      [s.labelAmount, `${data.amount} ${cur}`],
      [s.labelPaymentMethod, data.paymentMethod],
      [s.labelTransactionId, data.transactionId],
    ],
  }, { locale });
  await send(data.to, s.subject(data.amount), html);
}

// ─── 2. Installment Request Received ────────────────────────────────────────

export async function sendInstallmentRequestReceived(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).installmentRequestReceived;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
    ],
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 3. Installment Approved ────────────────────────────────────────────────

export async function sendInstallmentApproved(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).installmentApproved;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/bookings` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 4. Installment Rejected ────────────────────────────────────────────────

export async function sendInstallmentRejected(data: {
  to: string;
  userName: string;
  programTitle: string;
  reason: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).installmentRejected;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}\n\n${s.fullPayNote}`,
    infoBox: [
      [s.labelReason, data.reason],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/programs` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 5. Payment Reminder ────────────────────────────────────────────────────

export async function sendPaymentReminder(data: {
  to: string;
  userName: string;
  programTitle: string;
  amountDue: number;
  dueDate: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).paymentReminder;
  const cur = t(locale).currency;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
      [s.labelAmountDue, `${data.amountDue} ${cur}`],
      [s.labelDueDate, data.dueDate],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/payments` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 6. Payment Overdue ─────────────────────────────────────────────────────

export async function sendPaymentOverdue(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  bookingId?: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).paymentOverdue;
  const cur = t(locale).currency;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
      [s.labelOverdueAmount, `${data.amount} ${cur}`],
    ],
    alert: s.alert,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/payments` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 7. Refund Approved ─────────────────────────────────────────────────────

export async function sendRefundApproved(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).refundApproved;
  const cur = t(locale).currency;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.amount, cur, data.programTitle)}\n\n${s.transfer}`,
    infoBox: [
      [s.labelProgram, data.programTitle],
      [s.labelRefundAmount, `${data.amount} ${cur}`],
    ],
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 8. Refund Rejected ─────────────────────────────────────────────────────

export async function sendRefundRejected(data: {
  to: string;
  userName: string;
  programTitle: string;
  reason: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).refundRejected;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    infoBox: [
      [s.labelReason, data.reason],
    ],
    cta: { text: s.cta, url: `${APP_URL()}/support` },
  }, { locale });
  await send(data.to, s.subject, html);
}

// ─── 9. Installment Approval Expiring ───────────────────────────────────────

export async function sendInstallmentApprovalExpiring(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const locale = data.locale ?? 'ar';
  const s = t(locale).installmentApprovalExpiring;
  const html = buildEmailLayout({
    title: s.title,
    body: `${greeting(data.userName, locale)}\n\n${s.body(data.programTitle)}`,
    alert: s.alert,
    cta: { text: s.cta, url: `${APP_URL()}/dashboard/payments` },
  }, { locale });
  await send(data.to, s.subject, html);
}
