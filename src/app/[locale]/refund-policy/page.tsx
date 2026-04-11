import React from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { buildPageMetadata } from '@/lib/seo/metadata';
import styles from './page.module.css';

type RefundSection = {
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
    path: '/refund-policy',
    titleAr: 'سياسة الاسترداد',
    titleEn: 'Refund Policy',
    descriptionAr: 'تعرف على شروط وسياسة استرداد المدفوعات في Next Academy.',
    descriptionEn: 'Review Next Academy refund policy and eligibility terms.',
  });
}

export default async function RefundPolicyPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const sections: RefundSection[] = isAr
    ? [
        {
          id: 'general',
          title: 'السياسة العامة',
          paragraphs: [
            'نلتزم في Next Academy بتقديم تجربة تعليمية عملية عالية الجودة. وقد تكون مؤهلاً لاسترداد المبلغ وفق نوع البرنامج وتوقيت تقديم الطلب كما هو موضح أدناه.',
          ],
        },
        {
          id: 'workshops',
          title: 'الورش والجولات المباشرة',
          paragraphs: [
            'بالنسبة للورش المباشرة أو البرامج الجماعية الحضورية، يُقبل طلب الاسترداد حتى 7 أيام قبل تاريخ البدء. الطلبات المقدمة خلال آخر 7 أيام لا تكون مؤهلة للاسترداد بسبب حجز المقعد والتجهيز التشغيلي.',
          ],
        },
        {
          id: 'courses',
          title: 'الدورات المسجلة',
          paragraphs: [
            'تتوفر ضمانة استرداد خلال 14 يوماً للدورات المسجلة بالكامل، بشرط ألا تتجاوز نسبة المشاهدة 20% من المحتوى. إذا تم استهلاك جزء كبير من الدورة فلن يكون الطلب مؤهلاً للاسترداد.',
          ],
        },
        {
          id: 'process',
          title: 'آلية تقديم الطلب',
          paragraphs: [
            'يمكنك تقديم طلب الاسترداد من لوحة المستخدم عبر الحجز المطلوب ثم اختيار "طلب استرداد". تتم مراجعة الطلب عادة خلال 48 ساعة عمل، وعند الموافقة يتم رد المبلغ إلى وسيلة الدفع الأصلية وقد يستغرق ظهوره 5 إلى 10 أيام عمل.',
          ],
        },
      ]
    : [
        {
          id: 'general',
          title: 'General Policy',
          paragraphs: [
            'At Next Academy, we are committed to delivering high-quality practical education. Refund eligibility depends on program type and request timing as outlined below.',
          ],
        },
        {
          id: 'workshops',
          title: 'Workshops & Live Cohorts',
          paragraphs: [
            'For live cohort or in-person workshops, refund requests are accepted up to 7 days before the start date. Requests submitted within 7 days of start are not eligible due to reserved seat and operational commitments.',
          ],
        },
        {
          id: 'courses',
          title: 'Pre-Recorded Courses',
          paragraphs: [
            'A 14-day money-back guarantee applies to fully pre-recorded courses, provided you have consumed less than 20% of the course. Requests after substantial content consumption are not eligible.',
          ],
        },
        {
          id: 'process',
          title: 'Request Process',
          paragraphs: [
            'To request a refund, open your dashboard, select the booking, then choose "Request Refund". Requests are usually reviewed within 48 business hours. Approved refunds are returned to the original payment method and may appear within 5-10 business days.',
          ],
        },
      ];

  const title = isAr ? 'سياسة الاسترداد' : 'Refund Policy';
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
