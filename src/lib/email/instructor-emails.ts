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

export async function sendInstructorOnboardingSubmitted(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = pick(locale, {
    ar: '✅ تم استلام طلب انضمامك كمحاضر',
    en: '✅ Your instructor onboarding request was received',
  });
  const title = pick(locale, {
    ar: 'تم استلام طلبك بنجاح',
    en: 'Your submission is now under review',
  });
  const body = pick(locale, {
    ar: `استلمنا بياناتك وبرنامجك المقترح "${data.programTitle}".\nفريق نيكست أكاديمي هيراجع الطلب وهنبعتلك النتيجة فور صدورها.`,
    en: `We received your profile and proposed program "${data.programTitle}".\nThe Next Academy team will review it and email you as soon as there is a decision.`,
  });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.userName, locale)}\n\n${body}`,
      cta: {
        text: pick(locale, {
          ar: 'فتح لوحة المحاضر',
          en: 'Open Instructor Dashboard',
        }),
        url: `${APP_URL()}/instructor`,
      },
    },
    { locale },
  );

  await send(data.to, subject, html);
}

export async function sendInstructorProfileApproved(data: {
  to: string;
  userName: string;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = pick(locale, {
    ar: '🎉 تم قبول ملفك كمحاضر',
    en: '🎉 Your instructor profile has been approved',
  });
  const title = pick(locale, {
    ar: 'مبروك! تم قبولك كمحاضر',
    en: 'Congratulations! You are now an approved instructor',
  });
  const body = pick(locale, {
    ar: 'دلوقتي تقدر تستخدم كل أقسام لوحة المحاضر وتبدأ إدارة جلساتك وبرامجك.',
    en: 'You can now access all instructor dashboard sections and start managing your sessions and programs.',
  });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.userName, locale)}\n\n${body}`,
      cta: {
        text: pick(locale, {
          ar: 'الدخول للوحة المحاضر',
          en: 'Go to Instructor Dashboard',
        }),
        url: `${APP_URL()}/instructor`,
      },
    },
    { locale },
  );

  await send(data.to, subject, html);
}

export async function sendInstructorProfileRejected(data: {
  to: string;
  userName: string;
  reason?: string | null;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = pick(locale, {
    ar: '⚠️ نتيجة مراجعة ملفك كمحاضر',
    en: '⚠️ Instructor profile review result',
  });
  const title = pick(locale, {
    ar: 'نحتاج تعديلات على ملفك قبل الموافقة',
    en: 'Your profile needs updates before approval',
  });
  const body = pick(locale, {
    ar: 'راجع الملاحظات وحدّث بياناتك ثم أعد الإرسال للمراجعة.',
    en: 'Please review the notes, update your details, then submit again for review.',
  });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.userName, locale)}\n\n${body}`,
      infoBox: data.reason
        ? [
            [
              pick(locale, { ar: 'سبب الرفض', en: 'Review notes' }),
              data.reason,
            ],
          ]
        : undefined,
      cta: {
        text: pick(locale, {
          ar: 'تعديل بياناتي',
          en: 'Update My Profile',
        }),
        url: `${APP_URL()}/instructor/onboarding`,
      },
    },
    { locale },
  );

  await send(data.to, subject, html);
}

export async function sendInstructorProgramApproved(data: {
  to: string;
  userName: string;
  programTitle: string;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = pick(locale, {
    ar: '✅ تمت الموافقة على البرنامج المقترح',
    en: '✅ Your proposed program was approved',
  });
  const title = pick(locale, {
    ar: 'تمت الموافقة على برنامجك',
    en: 'Your program proposal is approved',
  });
  const body = pick(locale, {
    ar: `ممتاز! تمت الموافقة على "${data.programTitle}"، وسيتم التنسيق معك على الخطوات التالية.`,
    en: `Great news! "${data.programTitle}" has been approved, and we will coordinate with you on the next steps.`,
  });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.userName, locale)}\n\n${body}`,
      cta: {
        text: pick(locale, {
          ar: 'عرض طلباتي',
          en: 'View My Submissions',
        }),
        url: `${APP_URL()}/instructor/program-submissions`,
      },
    },
    { locale },
  );

  await send(data.to, subject, html);
}

export async function sendInstructorProgramRejected(data: {
  to: string;
  userName: string;
  programTitle: string;
  reason?: string | null;
  locale?: string | null;
}): Promise<void> {
  const locale = asLocale(data.locale);
  const subject = pick(locale, {
    ar: '❌ تم طلب تعديلات على البرنامج المقترح',
    en: '❌ Your program proposal needs revisions',
  });
  const title = pick(locale, {
    ar: 'نحتاج تعديلات على البرنامج المقترح',
    en: 'Program proposal requires updates',
  });
  const body = pick(locale, {
    ar: `تمت مراجعة "${data.programTitle}" ونحتاج منك تعديل بعض النقاط قبل إعادة الإرسال.`,
    en: `We reviewed "${data.programTitle}" and need a few updates before re-submission.`,
  });

  const html = buildEmailLayout(
    {
      title,
      body: `${greeting(data.userName, locale)}\n\n${body}`,
      infoBox: data.reason
        ? [
            [
              pick(locale, { ar: 'ملاحظات المراجعة', en: 'Review notes' }),
              data.reason,
            ],
          ]
        : undefined,
      cta: {
        text: pick(locale, {
          ar: 'تعديل الطلب',
          en: 'Update Submission',
        }),
        url: `${APP_URL()}/instructor/program-submissions`,
      },
    },
    { locale },
  );

  await send(data.to, subject, html);
}
