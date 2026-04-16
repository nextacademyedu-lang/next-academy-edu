import { buildEmailLayout, send, SUPPORT_EMAIL } from './email-core';
import type { Locale } from './email-core';
import type { PaymentMismatch } from '../payment-reconciliation';

type LocalizedText = {
  ar: string;
  en: string;
};

function pick(locale: Locale, text: LocalizedText): string {
  return locale === 'en' ? text.en : text.ar;
}

function asLocale(value?: string | null): Locale {
  return value === 'en' ? 'en' : 'ar';
}

/**
 * CRM Sync Failure Alert
 * Pattern follows instructor-emails.ts as requested.
 */
export async function sendCrmSyncFailureAlert(data: {
  userId: string;
  userEmail: string;
  failureCount: number;
  lastError: string;
  timestamp: string;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale || 'en');
  const recipient = process.env.ADMIN_ALERT_EMAIL || 'ops@nextacademyedu.com';
  
  const subject = pick(locale, {
    ar: '⚠️ تنبيه: فشل مزامنة CRM متكرر',
    en: '⚠️ Alert: Repeated CRM Sync Failure',
  });
  
  const title = pick(locale, {
    ar: 'فشل مزامنة CRM لعدة مرات',
    en: 'CRM Sync Failure Threshold Reached',
  });
  
  const body = pick(locale, {
    ar: `تم رصد ${data.failureCount} حالات فشل متتالية لمزامنة بيانات المستخدم التالي في الـ CRM.`,
    en: `Threshold of ${data.failureCount} consecutive CRM sync failures has been reached for the user below.`,
  });

  const html = buildEmailLayout(
    {
      title,
      body,
      infoBox: [
        [pick(locale, { ar: 'معرف المستخدم', en: 'User ID' }), data.userId],
        [pick(locale, { ar: 'بريد المستخدم', en: 'User Email' }), data.userEmail],
        [pick(locale, { ar: 'عدد حالات الفشل', en: 'Failure Count' }), String(data.failureCount)],
        [pick(locale, { ar: 'آخر خطأ', en: 'Last Error' }), data.lastError],
        [pick(locale, { ar: 'الوقت', en: 'Timestamp' }), data.timestamp],
      ],
      alert: pick(locale, {
        ar: 'تحتاج هذه الحالة إلى تدخل يدوي أو مراجعة الاتصال بـ Twenty CRM.',
        en: 'This case requires manual intervention or review of Twenty CRM connectivity.',
      }),
    },
    { locale }
  );

  await send(recipient, subject, html);
}

/**
 * Payment Reconciliation Alert
 * (Keeping existing alert if it was added by another process)
 */
export async function sendReconciliationAlert(data: {
  mismatches: PaymentMismatch[];
  windowStart: string;
  windowEnd: string;
}): Promise<void> {
  const financeEmail = process.env.FINANCE_ADMIN_EMAIL || SUPPORT_EMAIL;
  
  const mismatchRows = data.mismatches.map(m => (
    `<tr>
      <td style="padding:8px;border:1px solid #333">${m.internalId}</td>
      <td style="padding:8px;border:1px solid #333">${m.gatewayId}</td>
      <td style="padding:8px;border:1px solid #333">${m.internalStatus} vs ${m.gatewayStatus}</td>
      <td style="padding:8px;border:1px solid #333">${m.amount} EGP</td>
      <td style="padding:8px;border:1px solid #333;font-size:12px">${m.reason}</td>
    </tr>`
  )).join('');

  const body = `
    A routine payment reconciliation check has detected <strong>${data.mismatches.length}</strong> mismatches for the period:
    <br/>
    <strong>From:</strong> ${data.windowStart}
    <br/>
    <strong>To:</strong> ${data.windowEnd}
    <br/><br/>
    Please review the following transactions in both Paymob Dashboard and Payload CMS:
    <br/><br/>
    <table style="width:100%;border-collapse:collapse;color:#C5C5C5;text-align:left">
      <thead>
        <tr style="background:#1a1a1a;color:#F1F6F1">
          <th style="padding:8px;border:1px solid #333">Internal ID</th>
          <th style="padding:8px;border:1px solid #333">Gateway ID</th>
          <th style="padding:8px;border:1px solid #333">Status</th>
          <th style="padding:8px;border:1px solid #333">Amount</th>
          <th style="padding:8px;border:1px solid #333">Reason</th>
        </tr>
      </thead>
      <tbody>
        ${mismatchRows}
      </tbody>
    </table>
  `;

  const html = buildEmailLayout({
    title: 'Payment Reconciliation Alert',
    body,
    alert: 'Financial mismatch detected! Immediate review required.',
  }, { locale: 'en' });

  await send(financeEmail, `[ALERT] Payment Reconciliation Mismatch (${data.mismatches.length})`, html);
}
