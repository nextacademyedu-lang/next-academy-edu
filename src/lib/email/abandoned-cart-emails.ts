import { buildEmailLayout, greeting, send } from './email-core';
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

export async function sendAbandonedCartEmail(data: {
  to: string;
  studentName: string;
  programName: string;
  price: number;
  checkoutUrl: string;
  followUp: boolean; // false = 1hr email, true = 24hr follow-up
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = data.followUp
    ? pick(locale, {
        ar: `⚠️ ستنفذ الأماكن المتاحة في برنامج "${data.programName}"`,
        en: `⚠️ Spots filling up for "${data.programName}"`,
      })
    : pick(locale, {
        ar: `🛒 هل نسيت شيئاً؟`,
        en: `🛒 Did you leave something behind?`,
      });

  const title = data.followUp
    ? pick(locale, {
        ar: `لا تفوت فرصة التعلم مع نيكست أكاديمي!`,
        en: `Don't miss the chance to learn with Next Academy!`,
      })
    : pick(locale, {
        ar: `ننتظرك لتكمل تسجيلك`,
        en: `We're waiting for you to complete your enrollment`,
      });

  const body = data.followUp
    ? pick(locale, {
        ar: `لاحظنا إنك مهتم ببرنامج "${data.programName}" بس لسه مكملتش التسجيل. الأماكن بتخلص بسرعة، ننصحك تحجز مكانك قبل اكتمال العدد.`,
        en: `We noticed you're interested in "${data.programName}" but haven't finished enrolling. Spots are filling up fast, so we recommend grabbing yours before it's too late.`,
      })
    : pick(locale, {
        ar: `سجلنا إنك بدأت عملية التسجيل في برنامج "${data.programName}" بس مكملتهاش. هل واجهتك أي مشكلة؟ تقدر تكمل التسجيل دلوقتي بضغطة واحدة.`,
        en: `It looks like you started enrolling in "${data.programName}" but didn't finish. Did you run into any trouble? You can pick up right where you left off.`,
      });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.studentName, locale)}\n\n${body}`,
      infoBox: [
        [pick(locale, { ar: 'البرنامج', en: 'Program' }), data.programName],
        [pick(locale, { ar: 'السعر', en: 'Price' }), `${data.price} EGP`],
      ],
      cta: {
        text: pick(locale, {
          ar: 'إكمال التسجيل الآن',
          en: 'Complete My Enrollment',
        }),
        url: data.checkoutUrl,
      },
    },
    { locale, showUnsubscribe: true },
  );

  await send(data.to, subject, html, {
    replyTo: 'support@nextacademyedu.com',
  });
}
