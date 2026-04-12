import { APP_URL, buildEmailLayout, greeting, send } from './email-core';
import type { Locale } from './email-core';

export type ContactScenario =
  | 'general_support'
  | 'sales_programs'
  | 'corporate_training'
  | 'partnerships'
  | 'complaint';

type LocalizedText = { ar: string; en: string };

function pick(locale: Locale, text: LocalizedText): string {
  return locale === 'en' ? text.en : text.ar;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scenarioLabel(locale: Locale, scenario: ContactScenario): string {
  const labels: Record<ContactScenario, LocalizedText> = {
    general_support: { ar: 'دعم عام', en: 'General Support' },
    sales_programs: { ar: 'البرامج والدورات', en: 'Programs & Courses' },
    corporate_training: { ar: 'التدريب المؤسسي', en: 'Corporate Training' },
    partnerships: { ar: 'شراكات', en: 'Partnerships' },
    complaint: { ar: 'شكوى', en: 'Complaint' },
  };
  return pick(locale, labels[scenario]);
}

function preferredChannelLabel(locale: Locale, channel?: string | null): string {
  const key = (channel || '').trim().toLowerCase();
  if (key === 'phone') return pick(locale, { ar: 'مكالمة هاتفية', en: 'Phone Call' });
  if (key === 'whatsapp') return pick(locale, { ar: 'واتساب', en: 'WhatsApp' });
  if (key === 'email') return pick(locale, { ar: 'الإيميل', en: 'Email' });
  return '-';
}

function asLocale(value?: string | null): Locale {
  return value === 'en' ? 'en' : 'ar';
}

export async function sendContactTeamNotification(data: {
  to: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  subject?: string | null;
  message: string;
  scenario: ContactScenario;
  preferredChannel?: string | null;
  preferredTime?: string | null;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const scenario = scenarioLabel(locale, data.scenario);
  const safeName = escapeHtml(data.name);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone);
  const safeCompany = escapeHtml((data.company || '-').trim() || '-');
  const safePreferredChannel = escapeHtml(preferredChannelLabel(locale, data.preferredChannel));
  const safePreferredTime = escapeHtml((data.preferredTime || '-').trim() || '-');
  const safeScenario = escapeHtml(scenario);
  const subject =
    (data.subject || '').trim() ||
    pick(locale, {
      ar: `استفسار جديد - ${scenario}`,
      en: `New Inquiry - ${scenario}`,
    });
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br />');

  const html = buildEmailLayout(
    {
      title: pick(locale, {
        ar: 'رسالة تواصل جديدة',
        en: 'New Contact Inquiry',
      }),
      body: pick(locale, {
        ar: 'تم استلام رسالة جديدة من نموذج التواصل.',
        en: 'A new message was submitted from the contact form.',
      }),
      infoBox: [
        [pick(locale, { ar: 'الاسم', en: 'Name' }), safeName],
        [pick(locale, { ar: 'الإيميل', en: 'Email' }), safeEmail],
        [pick(locale, { ar: 'رقم الهاتف', en: 'Phone' }), safePhone],
        [pick(locale, { ar: 'نوع الطلب', en: 'Scenario' }), safeScenario],
        [pick(locale, { ar: 'الشركة', en: 'Company' }), safeCompany],
        [pick(locale, { ar: 'طريقة التواصل المفضلة', en: 'Preferred Channel' }), safePreferredChannel],
        [pick(locale, { ar: 'الوقت المفضل', en: 'Preferred Time' }), safePreferredTime],
        [pick(locale, { ar: 'الموضوع', en: 'Subject' }), safeSubject],
      ],
      alert: safeMessage,
    },
    { locale },
  );

  await send(data.to, `[Contact] ${subject}`, html, { replyTo: data.email });
}

export async function sendContactAutoReply(data: {
  to: string;
  name: string;
  scenario: ContactScenario;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const scenario = scenarioLabel(locale, data.scenario);
  const safeScenario = escapeHtml(scenario);
  const safeName = escapeHtml(data.name);

  const subject = pick(locale, {
    ar: '✅ تم استلام رسالتك بنجاح',
    en: '✅ We received your message',
  });

  const html = buildEmailLayout(
    {
      title: pick(locale, {
        ar: 'تم استلام طلبك',
        en: 'Your inquiry is received',
      }),
      body: `${greeting(safeName, locale)}\n\n${pick(locale, {
        ar: `شكرًا لتواصلك معنا بخصوص "${safeScenario}". فريقنا سيرد عليك قريبًا على نفس البريد.`,
        en: `Thanks for contacting us about "${safeScenario}". Our team will get back to you soon by email.`,
      })}`,
      cta: {
        text: pick(locale, {
          ar: 'العودة إلى الموقع',
          en: 'Back to Website',
        }),
        url: `${APP_URL()}/${locale}`,
      },
    },
    { locale, showUnsubscribe: true },
  );

  await send(data.to, subject, html);
}
