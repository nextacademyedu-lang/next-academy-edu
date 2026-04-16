import { APP_URL, buildEmailLayout, greeting, send } from './email-core';
import type { Locale } from './email-core';

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

export async function sendSessionReminder(data: {
  to: string;
  studentName: string;
  programName: string;
  sessionDate: string; // formatted, e.g. "Monday, April 21 at 7:00 PM"
  instructorName: string;
  joinLink?: string | null;
  hoursUntil: 24 | 1;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = pick(locale, {
    ar: `⏰ تذكير: تبدأ جلستك خلال ${data.hoursUntil === 24 ? '24 ساعة' : 'ساعة واحدة'}`,
    en: `⏰ Reminder: Your session starts in ${data.hoursUntil} hour${data.hoursUntil === 24 ? 's' : ''}`,
  });

  const title = pick(locale, {
    ar: `مستعد لجلستك القادمة؟`,
    en: `Ready for your next session?`,
  });

  const body = pick(locale, {
    ar: `تذكير بجلستك في برنامج "${data.programName}" مع المحاضر ${data.instructorName}.\n\nستبدأ الجلسة في: ${data.sessionDate}.\n\nنتمنى لك جلسة ممتعة ومفيدة!`,
    en: `Reminder for your session in "${data.programName}" with instructor ${data.instructorName}.\n\nThe session starts at: ${data.sessionDate}.\n\nWe wish you an enjoyable and productive session!`,
  });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.studentName, locale)}\n\n${body}`,
      infoBox: [
        [pick(locale, { ar: 'البرنامج', en: 'Program' }), data.programName],
        [pick(locale, { ar: 'الموعد', en: 'Date/Time' }), data.sessionDate],
        [pick(locale, { ar: 'المحاضر', en: 'Instructor' }), data.instructorName],
      ],
      cta: data.joinLink
        ? {
            text: pick(locale, {
              ar: 'الانضمام للجلسة الآن',
              en: 'Join Session Now',
            }),
            url: data.joinLink,
          }
        : undefined,
    },
    { locale },
  );

  await send(data.to, subject, html);
}
