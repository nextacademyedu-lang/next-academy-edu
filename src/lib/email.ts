/**
 * Transactional email utility — Resend REST API
 * Used for booking confirmations, payment reminders, waitlist notifications, etc.
 */

const RESEND_API = 'https://api.resend.com/emails';
const FROM = process.env.RESEND_FROM_EMAIL || 'Next Academy <noreply@nextacademyedu.com>';

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

// ─── Templates ───────────────────────────────────────────────────────────────

export async function sendBookingConfirmation(data: {
  to: string;
  userName: string;
  programTitle: string;
  bookingCode: string;
  amount: number;
  startDate: string;
}): Promise<void> {
  await send(
    data.to,
    `✅ تم تأكيد حجزك — ${data.programTitle}`,
    `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#C51B1B">تم تأكيد حجزك! 🎉</h2>
      <p>أهلاً ${data.userName}،</p>
      <p>يسعدنا إخبارك بأن حجزك تم تأكيده بنجاح.</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0">
        <p><strong>البرنامج:</strong> ${data.programTitle}</p>
        <p><strong>رقم الحجز:</strong> ${data.bookingCode}</p>
        <p><strong>المبلغ المدفوع:</strong> ${data.amount} جنيه</p>
        <p><strong>تاريخ البدء:</strong> ${data.startDate}</p>
      </div>
      <p>سنتواصل معك قريباً بتفاصيل البرنامج.</p>
      <p style="color:#888;font-size:12px">Next Academy — nextacademyedu.com</p>
    </div>
    `,
  );
}

export async function sendPaymentReminder(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  dueDate: string;
  bookingId: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
  await send(
    data.to,
    `⚠️ تذكير بموعد القسط — ${data.programTitle}`,
    `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#D6A32B">تذكير بموعد القسط</h2>
      <p>أهلاً ${data.userName}،</p>
      <p>نذكرك بأن موعد سداد القسط القادم اقترب.</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0">
        <p><strong>البرنامج:</strong> ${data.programTitle}</p>
        <p><strong>المبلغ المستحق:</strong> ${data.amount} جنيه</p>
        <p><strong>تاريخ الاستحقاق:</strong> ${data.dueDate}</p>
      </div>
      <a href="${appUrl}/ar/checkout/${data.bookingId}"
         style="background:#C51B1B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
        ادفع الآن
      </a>
      <p style="color:#888;font-size:12px;margin-top:16px">Next Academy — nextacademyedu.com</p>
    </div>
    `,
  );
}

export async function sendWaitlistNotification(data: {
  to: string;
  userName: string;
  programTitle: string;
  roundId: string;
  expiresAt: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
  await send(
    data.to,
    `🎯 أصبح متاحاً مكان في ${data.programTitle}`,
    `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#C51B1B">مكان متاح الآن! 🎯</h2>
      <p>أهلاً ${data.userName}،</p>
      <p>أصبح متاحاً مكان في البرنامج الذي كنت تنتظره.</p>
      <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0">
        <p><strong>البرنامج:</strong> ${data.programTitle}</p>
        <p><strong>ينتهي العرض:</strong> ${data.expiresAt}</p>
      </div>
      <p style="color:#C51B1B"><strong>⚠️ هذا العرض محدود — احجز مكانك قبل انتهاء المهلة</strong></p>
      <a href="${appUrl}/ar/programs"
         style="background:#C51B1B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
        احجز الآن
      </a>
      <p style="color:#888;font-size:12px;margin-top:16px">Next Academy — nextacademyedu.com</p>
    </div>
    `,
  );
}

export async function sendOverdueNotification(data: {
  to: string;
  userName: string;
  programTitle: string;
  amount: number;
  bookingId: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
  await send(
    data.to,
    `🔴 قسط متأخر — ${data.programTitle}`,
    `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#C51B1B">قسط متأخر السداد</h2>
      <p>أهلاً ${data.userName}،</p>
      <p>لديك قسط متأخر السداد. يرجى السداد في أقرب وقت لتجنب تعليق الوصول للبرنامج.</p>
      <div style="background:#fff0f0;border:1px solid #C51B1B;border-radius:8px;padding:16px;margin:16px 0">
        <p><strong>البرنامج:</strong> ${data.programTitle}</p>
        <p><strong>المبلغ المتأخر:</strong> ${data.amount} جنيه</p>
      </div>
      <a href="${appUrl}/ar/checkout/${data.bookingId}"
         style="background:#C51B1B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">
        سدد الآن
      </a>
      <p style="color:#888;font-size:12px;margin-top:16px">Next Academy — nextacademyedu.com</p>
    </div>
    `,
  );
}
