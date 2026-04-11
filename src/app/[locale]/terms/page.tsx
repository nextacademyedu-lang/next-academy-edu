import React from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import styles from './page.module.css';
import { buildPageMetadata } from '@/lib/seo/metadata';

type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/terms',
    titleAr: 'الشروط والأحكام',
    titleEn: 'Terms & Conditions',
    descriptionAr: 'الشروط والأحكام المنظمة لاستخدام خدمات ومنتجات Next Academy.',
    descriptionEn: 'Terms and conditions governing the use of Next Academy services.',
  });
}

export default async function TermsPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const sections: TermsSection[] = isAr
    ? [
        {
          id: 'acceptance',
          title: 'قبول الشروط',
          paragraphs: [
            'باستخدامك لمنصة Next Academy فأنت توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية. إذا لم توافق على أي بند، يرجى التوقف عن استخدام الخدمة.',
          ],
        },
        {
          id: 'services',
          title: 'وصف الخدمات',
          paragraphs: [
            'تقدم Next Academy برامج تعليمية تشمل الورش والدورات والندوات والاستشارات المهنية. وقد نقوم بتحديث أو تعديل أي جزء من الخدمات بما يتوافق مع التطوير التشغيلي والأكاديمي.',
          ],
        },
        {
          id: 'registration',
          title: 'التسجيل وأمان الحساب',
          paragraphs: [
            'للاستفادة من بعض المزايا، يجب إنشاء حساب ببيانات صحيحة ومحدثة. أنت مسؤول عن سرية بيانات الدخول وكل نشاط يتم من خلال حسابك.',
          ],
        },
        {
          id: 'payments',
          title: 'المدفوعات والتقسيط',
          paragraphs: [
            'تظهر الرسوم في صفحات البرامج. وعند اختيار التقسيط، فإنك توافق على جدولة الخصم وفق الخطة المحددة. التأخر أو التعثر في السداد قد يؤدي إلى تعليق الوصول مؤقتاً حتى التسوية.',
          ],
        },
        {
          id: 'intellectual-property',
          title: 'الملكية الفكرية',
          paragraphs: [
            'جميع المواد التعليمية والمحتوى المعروض عبر المنصة مملوك لـ Next Academy أو مقدمي المحتوى المرخصين. لا يجوز نسخ أو إعادة توزيع المواد لأغراض تجارية دون إذن كتابي مسبق.',
          ],
        },
      ]
    : [
        {
          id: 'acceptance',
          title: 'Acceptance of Terms',
          paragraphs: [
            'By using the Next Academy platform, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, you should discontinue use of the service.',
          ],
        },
        {
          id: 'services',
          title: 'Description of Services',
          paragraphs: [
            'Next Academy provides educational programs including workshops, courses, webinars, and professional consultations. We may update or modify any part of the services to improve academic and operational quality.',
          ],
        },
        {
          id: 'registration',
          title: 'Registration & Account Security',
          paragraphs: [
            'Access to certain features requires account registration with accurate and current information. You are responsible for safeguarding login credentials and all activities under your account.',
          ],
        },
        {
          id: 'payments',
          title: 'Payments & Installments',
          paragraphs: [
            'Program fees are displayed on program pages. If you select installments, you authorize recurring charges according to the agreed schedule. Delayed payments may result in temporary access suspension until resolved.',
          ],
        },
        {
          id: 'intellectual-property',
          title: 'Intellectual Property',
          paragraphs: [
            'All educational materials and platform content are owned by Next Academy or licensed contributors. Reproduction, redistribution, or commercial use is prohibited without prior written consent.',
          ],
        },
      ];

  const title = isAr ? 'الشروط والأحكام' : 'Terms & Conditions';
  const updated = isAr ? 'آخر تحديث: أبريل 2026' : 'Last Updated: April 2026';
  const contentsLabel = isAr ? 'المحتويات' : 'Contents';

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.lastUpdated}>{updated}</p>
          </div>

          <div className={styles.contentLayout}>
            <aside className={styles.sidebar}>
              <div className={styles.stickyNav}>
                <h3 className={styles.navTitle}>{contentsLabel}</h3>
                <ul className={styles.navList}>
                  {sections.map((section, index) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>
                        {index + 1}. {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <article className={styles.document}>
              {sections.map((section, index) => (
                <section key={section.id} id={section.id} className={styles.docSection}>
                  <h2>
                    {index + 1}. {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
