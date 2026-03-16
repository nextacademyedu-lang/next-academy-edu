/**
 * Transactional email utility — Resend REST API
 * Shared layout + template registry for all 31 email templates.
 *
 * Architecture:
 *   buildEmailLayout(content, options)  → full HTML with header/footer
 *   templates[id](vars)                → { subject, body }
 *   sendEmail(templateId, to, vars)    → send via Resend
 */

// ─── Config ──────────────────────────────────────────────────────────────────

const RESEND_API = 'https://api.resend.com/emails';
const FROM = process.env.RESEND_FROM_EMAIL || 'Next Academy <noreply@nextacademyedu.com>';
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
const LOGO_URL = () => `${APP_URL()}/logo.png`;
const SUPPORT_EMAIL = 'support@nextacademyedu.com';

// ─── Types ───────────────────────────────────────────────────────────────────

type Locale = 'ar' | 'en';

interface EmailContent {
  title: string;
  body: string;
  /** Optional CTA button */
  cta?: { text: string; url: string };
  /** Optional info box rows: [label, value][] */
  infoBox?: [string, string][];
  /** Optional warning/alert text */
  alert?: string;
}

interface LayoutOptions {
  locale?: Locale;
  /** Show unsubscribe link (for engagement emails) */
  showUnsubscribe?: boolean;
}

// ─── Shared Layout ───────────────────────────────────────────────────────────

function buildEmailLayout(content: EmailContent, options: LayoutOptions = {}): string {
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

async function send(to: string, subject: string, html: string): Promise<void> {
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

function greeting(name: string, locale: Locale = 'ar'): string {
  return locale === 'ar' ? `أهلاً ${name}،` : `Hi ${name},`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH TEMPLATES (1-3)
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendWelcome(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'مرحباً بك في Next Academy!' : 'Welcome to Next Academy!';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'مرحباً بك! 🎉' : 'Welcome! 🎉',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'تم إنشاء حسابك بنجاح. يمكنك الآن تصفح البرامج والحجز.' : 'Your account has been created successfully. You can now browse programs and book.'}</p>`,
    cta: {
      text: l === 'ar' ? 'تصفح البرامج' : 'Browse Programs',
      url: `${APP_URL()}/${l}/programs`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendEmailVerification(data: {
  to: string;
  userName: string;
  verificationUrl: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'أكّد بريدك الإلكتروني' : 'Verify your email';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تأكيد البريد الإلكتروني' : 'Email Verification',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'اضغط على الزر التالي لتأكيد بريدك الإلكتروني.' : 'Click the button below to verify your email address.'}</p>`,
    cta: {
      text: l === 'ar' ? 'تأكيد البريد' : 'Verify Email',
      url: data.verificationUrl,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendPasswordReset(data: {
  to: string;
  userName: string;
  resetUrl: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset your password';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reset Your Password',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'تلقينا طلباً لإعادة تعيين كلمة مرورك. اضغط على الزر التالي.' : 'We received a request to reset your password. Click the button below.'}</p>
           <p style="color:#888;font-size:13px">${l === 'ar' ? 'إذا لم تطلب ذلك، تجاهل هذا البريد.' : 'If you didn\'t request this, ignore this email.'}</p>`,
    cta: {
      text: l === 'ar' ? 'إعادة تعيين' : 'Reset Password',
      url: data.resetUrl,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOKING TEMPLATES (4, 17, 31)
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendBookingConfirmation(data: {
  to: string;
  userName: string;
  programTitle: string;
  bookingCode: string;
  amount: number;
  startDate: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const currency = l === 'ar' ? 'ج.م' : 'EGP';
  const subject = l === 'ar'
    ? `✅ تم تأكيد حجزك — ${data.programTitle}`
    : `✅ Booking Confirmed — ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم تأكيد حجزك! 🎉' : 'Booking Confirmed! 🎉',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'يسعدنا إخبارك بأن حجزك تم تأكيده بنجاح.' : 'We\'re happy to let you know your booking has been confirmed.'}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'رقم الحجز' : 'Booking Code', data.bookingCode],
      [l === 'ar' ? 'المبلغ المدفوع' : 'Amount Paid', `${data.amount} ${currency}`],
      [l === 'ar' ? 'تاريخ البدء' : 'Start Date', data.startDate],
    ],
    cta: {
      text: l === 'ar' ? 'عرض تفاصيل الحجز' : 'View Booking Details',
      url: `${APP_URL()}/${l}/dashboard/bookings`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendBookingCancelled(data: {
  to: string;
  userName: string;
  programTitle: string;
  bookingCode: string;
  reason?: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `❌ تم إلغاء حجزك — ${data.programTitle}`
    : `❌ Booking Cancelled — ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم إلغاء الحجز' : 'Booking Cancelled',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تم إلغاء حجزك في ${data.programTitle}.` : `Your booking for ${data.programTitle} has been cancelled.`}</p>
           ${data.reason ? `<p style="color:#888">${l === 'ar' ? 'السبب' : 'Reason'}: ${data.reason}</p>` : ''}`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'رقم الحجز' : 'Booking Code', data.bookingCode],
    ],
    cta: {
      text: l === 'ar' ? 'تصفح البرامج' : 'Browse Programs',
      url: `${APP_URL()}/${l}/programs`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendRoundCancelled(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundDate: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `❌ للأسف الجولة اتلغت — ${data.programTitle}`
    : `❌ Round Cancelled — ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم إلغاء الجولة' : 'Round Cancelled',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `نعتذر عن إلغاء الجولة الخاصة ببرنامج ${data.programTitle} المقررة يوم ${data.roundDate}.` : `We're sorry to inform you that the round for ${data.programTitle} scheduled on ${data.roundDate} has been cancelled.`}</p>
           <p>${l === 'ar' ? 'سنتواصل معك بخصوص البدائل المتاحة.' : 'We will contact you about available alternatives.'}</p>`,
    cta: {
      text: l === 'ar' ? 'تصفح البرامج' : 'Browse Programs',
      url: `${APP_URL()}/${l}/programs`,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT TEMPLATES (5-10)
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendPaymentReceipt(data: {
  to: string;
  userName: string;
  amount: number;
  programTitle: string;
  transactionId: string;
  paymentMethod: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const currency = l === 'ar' ? 'ج.م' : 'EGP';
  const subject = l === 'ar'
    ? `إيصال الدفع — ${data.amount} ${currency}`
    : `Payment Receipt — ${currency} ${data.amount}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'إيصال الدفع' : 'Payment Receipt',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'تم استلام دفعتك بنجاح.' : 'Your payment has been received successfully.'}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'المبلغ' : 'Amount', `${data.amount} ${currency}`],
      [l === 'ar' ? 'طريقة الدفع' : 'Payment Method', data.paymentMethod],
      [l === 'ar' ? 'رقم العملية' : 'Transaction ID', data.transactionId],
    ],
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendInstallmentRequestReceived(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'تم استلام طلب التقسيط' : 'Installment Request Received';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم استلام طلبك' : 'Request Received',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تم استلام طلب التقسيط الخاص ببرنامج ${data.programTitle}. سنراجعه ونرد عليك خلال 48 ساعة.` : `Your installment request for ${data.programTitle} has been received. We'll review it and respond within 48 hours.`}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
    ],
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendInstallmentApproved(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? '✅ تم الموافقة على طلب التقسيط' : '✅ Installment Request Approved';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم الموافقة! ✅' : 'Approved! ✅',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تمت الموافقة على طلب التقسيط الخاص ببرنامج ${data.programTitle}. أكمل الحجز خلال 7 أيام.` : `Your installment request for ${data.programTitle} has been approved. Complete your booking within 7 days.`}</p>`,
    cta: {
      text: l === 'ar' ? 'أكمل الحجز' : 'Complete Booking',
      url: `${APP_URL()}/${l}/book/${data.roundId}`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendInstallmentRejected(data: {
  to: string;
  userName: string;
  programTitle: string;
  reason?: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? '❌ لم يتم قبول طلب التقسيط' : '❌ Installment Request Rejected';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'لم يتم قبول الطلب' : 'Request Not Approved',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `نعتذر، لم يتم قبول طلب التقسيط الخاص ببرنامج ${data.programTitle}.` : `We're sorry, your installment request for ${data.programTitle} was not approved.`}</p>
           ${data.reason ? `<p style="color:#888">${l === 'ar' ? 'السبب' : 'Reason'}: ${data.reason}</p>` : ''}
           <p>${l === 'ar' ? 'يمكنك الدفع الكامل أو التواصل معنا للمساعدة.' : 'You can pay in full or contact us for assistance.'}</p>`,
    cta: {
      text: l === 'ar' ? 'تواصل معنا' : 'Contact Us',
      url: `mailto:${SUPPORT_EMAIL}`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendPaymentReminder(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  dueDate: string;
  bookingId: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const currency = l === 'ar' ? 'ج.م' : 'EGP';
  const subject = l === 'ar'
    ? `⏰ تذكير: قسط مستحق بعد 3 أيام`
    : `⏰ Payment Reminder: Installment Due in 3 Days`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تذكير بموعد القسط' : 'Installment Reminder',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'نذكرك بأن موعد سداد القسط القادم اقترب.' : 'This is a reminder that your next installment is due soon.'}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'المبلغ المستحق' : 'Amount Due', `${data.amount} ${currency}`],
      [l === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date', data.dueDate],
    ],
    cta: {
      text: l === 'ar' ? 'ادفع الآن' : 'Pay Now',
      url: `${APP_URL()}/${l}/checkout/${data.bookingId}`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendPaymentOverdue(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  bookingId: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const currency = l === 'ar' ? 'ج.م' : 'EGP';
  const subject = l === 'ar'
    ? `⚠️ قسط متأخر — ادفع دلوقتي`
    : `⚠️ Overdue Installment — Pay Now`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'قسط متأخر السداد' : 'Overdue Installment',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'لديك قسط متأخر السداد. يرجى السداد في أقرب وقت لتجنب تعليق الوصول للبرنامج.' : 'You have an overdue installment. Please pay as soon as possible to avoid having your program access suspended.'}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'المبلغ المتأخر' : 'Overdue Amount', `${data.amount} ${currency}`],
    ],
    alert: l === 'ar' ? 'قد يتم تعليق وصولك للبرنامج في حالة عدم السداد' : 'Your program access may be suspended if payment is not received',
    cta: {
      text: l === 'ar' ? 'سدد الآن' : 'Pay Now',
      url: `${APP_URL()}/${l}/checkout/${data.bookingId}`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSULTATION TEMPLATES (11-14)
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendConsultationConfirmed(data: {
  to: string;
  userName: string;
  instructorName: string;
  consultationDate: string;
  consultationTime: string;
  meetingLink: string;
  duration: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `✅ تم حجز الاستشارة — ${data.instructorName}`
    : `✅ Consultation Confirmed — ${data.instructorName}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم تأكيد الاستشارة! ✅' : 'Consultation Confirmed! ✅',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تم حجز استشارتك مع ${data.instructorName}.` : `Your consultation with ${data.instructorName} has been confirmed.`}</p>`,
    infoBox: [
      [l === 'ar' ? 'المستشار' : 'Consultant', data.instructorName],
      [l === 'ar' ? 'التاريخ' : 'Date', data.consultationDate],
      [l === 'ar' ? 'الوقت' : 'Time', data.consultationTime],
      [l === 'ar' ? 'المدة' : 'Duration', data.duration],
    ],
    cta: {
      text: l === 'ar' ? 'رابط الاجتماع' : 'Join Meeting',
      url: data.meetingLink,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendConsultationReminder24h(data: {
  to: string;
  userName: string;
  instructorName: string;
  consultationTime: string;
  meetingLink: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `⏰ استشارتك بكرة الساعة ${data.consultationTime}`
    : `⏰ Your Consultation is Tomorrow at ${data.consultationTime}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تذكير: استشارتك بكرة' : 'Reminder: Your Consultation is Tomorrow',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تذكير بأن استشارتك مع ${data.instructorName} بكرة الساعة ${data.consultationTime}.` : `This is a reminder that your consultation with ${data.instructorName} is tomorrow at ${data.consultationTime}.`}</p>`,
    cta: {
      text: l === 'ar' ? 'رابط الاجتماع' : 'Meeting Link',
      url: data.meetingLink,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendConsultationReminder1h(data: {
  to: string;
  userName: string;
  meetingLink: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? '🔔 استشارتك بعد ساعة!' : '🔔 Your Consultation is in 1 Hour!';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'استشارتك بعد ساعة! 🔔' : 'Your Consultation is in 1 Hour! 🔔',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'جهز نفسك! استشارتك بتبدأ بعد ساعة.' : 'Get ready! Your consultation starts in 1 hour.'}</p>`,
    cta: {
      text: l === 'ar' ? 'ادخل الآن' : 'Join Now',
      url: data.meetingLink,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendConsultationCancelled(data: {
  to: string;
  userName: string;
  instructorName: string;
  consultationDate: string;
  reason?: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? '❌ تم إلغاء الاستشارة' : '❌ Consultation Cancelled';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم إلغاء الاستشارة' : 'Consultation Cancelled',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تم إلغاء استشارتك مع ${data.instructorName} المقررة يوم ${data.consultationDate}.` : `Your consultation with ${data.instructorName} scheduled on ${data.consultationDate} has been cancelled.`}</p>
           ${data.reason ? `<p style="color:#888">${l === 'ar' ? 'السبب' : 'Reason'}: ${data.reason}</p>` : ''}`,
    cta: {
      text: l === 'ar' ? 'احجز موعد جديد' : 'Book New Consultation',
      url: `${APP_URL()}/${l}/consultations`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT TEMPLATES (18-21)
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendAccountDeletionConfirm(data: {
  to: string;
  userName: string;
  confirmUrl: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'تأكيد حذف الحساب' : 'Account Deletion Confirmation';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تأكيد حذف الحساب' : 'Confirm Account Deletion',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'تلقينا طلباً لحذف حسابك. إذا كنت متأكداً، اضغط على الزر التالي. سيتم حذف حسابك خلال 24 ساعة.' : 'We received a request to delete your account. If you\'re sure, click the button below. Your account will be deleted within 24 hours.'}</p>`,
    alert: l === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone',
    cta: {
      text: l === 'ar' ? 'تأكيد الحذف' : 'Confirm Deletion',
      url: data.confirmUrl,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendAccountDeleted(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'تم حذف حسابك' : 'Your Account Has Been Deleted';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم حذف حسابك' : 'Account Deleted',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'تم حذف حسابك بنجاح وجميع بياناتك. نتمنى لك التوفيق.' : 'Your account and all associated data have been deleted. We wish you all the best.'}</p>
           <p>${l === 'ar' ? 'إذا غيرت رأيك، يمكنك إنشاء حساب جديد في أي وقت.' : 'If you change your mind, you can create a new account at any time.'}</p>`,
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendEmailChanged(data: {
  to: string;
  userName: string;
  newEmail: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? 'تم تغيير بريدك الإلكتروني' : 'Your Email Has Been Changed';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم تغيير البريد الإلكتروني' : 'Email Changed',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تم تغيير بريدك الإلكتروني إلى ${data.newEmail}.` : `Your email has been changed to ${data.newEmail}.`}</p>
           <p>${l === 'ar' ? 'إذا لم تقم بهذا التغيير، تواصل معنا فوراً.' : 'If you did not make this change, contact us immediately.'}</p>`,
    cta: {
      text: l === 'ar' ? 'تواصل مع الدعم' : 'Contact Support',
      url: `mailto:${SUPPORT_EMAIL}`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendSecurityAlert(data: {
  to: string;
  userName: string;
  ipAddress: string;
  location?: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? '⚠️ تنبيه أمني — محاولة دخول غير معتادة'
    : '⚠️ Security Alert — Unusual Login Attempt';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تنبيه أمني ⚠️' : 'Security Alert ⚠️',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'لاحظنا محاولة دخول غير معتادة لحسابك.' : 'We noticed an unusual login attempt on your account.'}</p>`,
    infoBox: [
      [l === 'ar' ? 'عنوان IP' : 'IP Address', data.ipAddress],
      ...(data.location ? [[l === 'ar' ? 'الموقع' : 'Location', data.location] as [string, string]] : []),
    ],
    alert: l === 'ar' ? 'إذا لم تكن أنت، غيّر كلمة المرور فوراً' : 'If this wasn\'t you, change your password immediately',
    cta: {
      text: l === 'ar' ? 'تغيير كلمة المرور' : 'Change Password',
      url: `${APP_URL()}/${l}/dashboard/settings`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFUND TEMPLATES (15-16)
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendRefundApproved(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const currency = l === 'ar' ? 'ج.م' : 'EGP';
  const subject = l === 'ar' ? '✅ تم الموافقة على طلب الاسترداد' : '✅ Refund Request Approved';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم الموافقة على الاسترداد ✅' : 'Refund Approved ✅',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `تمت الموافقة على طلب استرداد مبلغ ${data.amount} ${currency} الخاص ببرنامج ${data.programTitle}.` : `Your refund request of ${currency} ${data.amount} for ${data.programTitle} has been approved.`}</p>
           <p>${l === 'ar' ? 'سيتم تحويل المبلغ خلال 5-10 أيام عمل.' : 'The amount will be transferred within 5-10 business days.'}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'مبلغ الاسترداد' : 'Refund Amount', `${data.amount} ${currency}`],
    ],
  }, { locale: l });
  await send(data.to, subject, html);
}

export async function sendRefundRejected(data: {
  to: string;
  userName: string;
  programTitle: string;
  reason?: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? '❌ تم رفض طلب الاسترداد' : '❌ Refund Request Rejected';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'تم رفض طلب الاسترداد' : 'Refund Request Rejected',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `لم يتم قبول طلب الاسترداد الخاص ببرنامج ${data.programTitle}.` : `Your refund request for ${data.programTitle} was not approved.`}</p>
           ${data.reason ? `<p style="color:#888">${l === 'ar' ? 'السبب' : 'Reason'}: ${data.reason}</p>` : ''}`,
    cta: {
      text: l === 'ar' ? 'تواصل معنا' : 'Contact Us',
      url: `mailto:${SUPPORT_EMAIL}`,
    },
  }, { locale: l });
  await send(data.to, subject, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGAGEMENT TEMPLATES (22-30) — showUnsubscribe: true
// ═══════════════════════════════════════════════════════════════════════════════

export async function sendReviewRequest(data: {
  to: string;
  userName: string;
  programTitle: string;
  reviewUrl: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `⭐ قيّم تجربتك في ${data.programTitle}`
    : `⭐ Rate Your Experience with ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'رأيك يهمنا! ⭐' : 'Your Feedback Matters! ⭐',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `خلصت برنامج ${data.programTitle}! عاملك إيه؟ شاركنا رأيك.` : `You've completed ${data.programTitle}! How was your experience? Share your feedback.`}</p>`,
    cta: {
      text: l === 'ar' ? 'قيّم الآن' : 'Rate Now',
      url: data.reviewUrl,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendReviewReminder(data: {
  to: string;
  userName: string;
  programTitle: string;
  reviewUrl: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `⭐ رأيك يهمنا — قيّم ${data.programTitle}`
    : `⭐ We'd Love Your Feedback — Rate ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'لسه منتظرين رأيك ⭐' : 'Still Waiting for Your Review ⭐',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `رأيك في ${data.programTitle} يساعد طلاب تانيين يختاروا. خد دقيقة وشاركنا.` : `Your review of ${data.programTitle} helps other students decide. Take a minute to share.`}</p>`,
    cta: {
      text: l === 'ar' ? 'قيّم الآن' : 'Rate Now',
      url: data.reviewUrl,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendWaitlistSpotAvailable(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  expiresAt: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `🎉 مكان متاح في ${data.programTitle}!`
    : `🎉 Spot Available in ${data.programTitle}!`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'مكان متاح الآن! 🎉' : 'Spot Available Now! 🎉',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `أصبح متاحاً مكان في ${data.programTitle} الذي كنت تنتظره.` : `A spot has opened up in ${data.programTitle} that you were waiting for.`}</p>`,
    infoBox: [
      [l === 'ar' ? 'البرنامج' : 'Program', data.programTitle],
      [l === 'ar' ? 'ينتهي العرض' : 'Offer Expires', data.expiresAt],
    ],
    alert: l === 'ar' ? 'هذا العرض محدود — احجز مكانك قبل انتهاء المهلة' : 'This offer is limited — book your spot before it expires',
    cta: {
      text: l === 'ar' ? 'احجز الآن' : 'Book Now',
      url: `${APP_URL()}/${l}/book/${data.roundId}`,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendCertificateReady(data: {
  to: string;
  userName: string;
  programTitle: string;
  certificateUrl: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `🎓 شهادتك جاهزة! — ${data.programTitle}`
    : `🎓 Your Certificate is Ready! — ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'مبروك! شهادتك جاهزة 🎓' : 'Congratulations! Your Certificate is Ready 🎓',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `مبروك على إتمام برنامج ${data.programTitle}! شهادتك جاهزة للتحميل.` : `Congratulations on completing ${data.programTitle}! Your certificate is ready to download.`}</p>`,
    cta: {
      text: l === 'ar' ? 'حمّل الشهادة' : 'Download Certificate',
      url: data.certificateUrl,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendRoundReminder3d(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundDate: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `📅 الجولة بتبدأ بعد 3 أيام — ${data.programTitle}`
    : `📅 Round Starts in 3 Days — ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'الجولة بتبدأ قريب! 📅' : 'Round Starting Soon! 📅',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `جولة ${data.programTitle} بتبدأ يوم ${data.roundDate}. جهز نفسك!` : `The ${data.programTitle} round starts on ${data.roundDate}. Get ready!`}</p>`,
    cta: {
      text: l === 'ar' ? 'عرض التفاصيل' : 'View Details',
      url: `${APP_URL()}/${l}/dashboard/bookings`,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendRoundReminder1d(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `📅 بكرة! جهز نفسك لـ ${data.programTitle}`
    : `📅 Tomorrow! Get Ready for ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? 'بكرة بتبدأ! 🚀' : 'Starting Tomorrow! 🚀',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `بكرة! ${data.programTitle} بيبدأ. جهز نفسك! 💪` : `Tomorrow! ${data.programTitle} begins. Get ready! 💪`}</p>`,
    cta: {
      text: l === 'ar' ? 'عرض التفاصيل' : 'View Details',
      url: `${APP_URL()}/${l}/dashboard/bookings`,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendInstallmentApprovalExpiring(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? '⏰ موافقة التقسيط بتنتهي بعد يومين!'
    : '⏰ Installment Approval Expiring in 2 Days!';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'موافقة التقسيط بتنتهي قريب ⏰' : 'Approval Expiring Soon ⏰',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `موافقة التقسيط الخاصة ببرنامج ${data.programTitle} بتنتهي بعد يومين. أكمل الحجز قبل ما تنتهي.` : `Your installment approval for ${data.programTitle} expires in 2 days. Complete your booking before it expires.`}</p>`,
    alert: l === 'ar' ? 'الموافقة ستنتهي خلال 48 ساعة' : 'Approval will expire in 48 hours',
    cta: {
      text: l === 'ar' ? 'أكمل الحجز' : 'Complete Booking',
      url: `${APP_URL()}/${l}/book/${data.roundId}`,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendInactiveUser(data: {
  to: string;
  userName: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar' ? '🔔 وحشتنا! شوف البرامج الجديدة' : '🔔 We Miss You! Check Out New Programs';
  const html = buildEmailLayout({
    title: l === 'ar' ? 'وحشتنا! 🔔' : 'We Miss You! 🔔',
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? 'مر وقت من آخر زيارة ليك. عندنا برامج جديدة ممكن تعجبك!' : 'It\'s been a while since your last visit. We have new programs you might like!'}</p>`,
    cta: {
      text: l === 'ar' ? 'تصفح البرامج' : 'Browse Programs',
      url: `${APP_URL()}/${l}/programs`,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

export async function sendNewProgramAnnouncement(data: {
  to: string;
  userName: string;
  programTitle: string;
  programUrl: string;
  description?: string;
  locale?: Locale;
}): Promise<void> {
  const l = data.locale || 'ar';
  const subject = l === 'ar'
    ? `🆕 برنامج جديد: ${data.programTitle}`
    : `🆕 New Program: ${data.programTitle}`;
  const html = buildEmailLayout({
    title: l === 'ar' ? `برنامج جديد: ${data.programTitle} 🆕` : `New Program: ${data.programTitle} 🆕`,
    body: `<p>${greeting(data.userName, l)}</p>
           <p>${l === 'ar' ? `عندنا برنامج جديد: ${data.programTitle}!` : `We have a new program: ${data.programTitle}!`}</p>
           ${data.description ? `<p style="color:#C5C5C5">${data.description}</p>` : ''}`,
    cta: {
      text: l === 'ar' ? 'اعرف أكتر' : 'Learn More',
      url: data.programUrl,
    },
  }, { locale: l, showUnsubscribe: true });
  await send(data.to, subject, html);
}

// ─── Legacy aliases (backward compatibility) ─────────────────────────────────

/** @deprecated Use sendWaitlistSpotAvailable instead */
export async function sendWaitlistNotification(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  expiresAt: string;
}): Promise<void> {
  return sendWaitlistSpotAvailable(data);
}

/** @deprecated Use sendPaymentOverdue instead */
export async function sendOverdueNotification(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  bookingId: string;
}): Promise<void> {
  return sendPaymentOverdue(data);
}
