import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/faq',
    titleAr: 'الأسئلة الشائعة',
    titleEn: 'FAQ',
    descriptionAr: 'إجابات سريعة على أكثر الأسئلة شيوعاً حول البرامج والتسجيل والدفع.',
    descriptionEn: 'Quick answers to common questions about programs, enrollment, and payments.',
  });
}

export default async function FaqPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const faqItems = isAr
    ? [
        {
          question: 'كيف أختار البرنامج المناسب؟',
          answer: 'ابدأ من دورك الحالي والهدف المهني القادم، ثم قارن البرامج حسب النتائج والمدرب وحجم التطبيق الأسبوعي.',
        },
        {
          question: 'هل أحصل على شهادة بعد الإكمال؟',
          answer: 'نعم، تُصدر الشهادات بعد استيفاء متطلبات الحضور أو الإكمال. ويمكن التحقق من الشهادات المؤهلة إلكترونياً.',
        },
        {
          question: 'هل توجد حلول مخصصة للشركات؟',
          answer: 'نعم، نوفر مقاعد فرق ومسارات مخصصة للشركات عبر حلول الأعمال. تواصل معنا لتصميم خطة مناسبة.',
        },
        {
          question: 'هل يمكن تغيير الدورة بعد التسجيل؟',
          answer: 'سياسة التغيير تعتمد على نوع البرنامج وموعد بدايته. يفضّل التواصل مع الدعم قبل أول جلسة مباشرة.',
        },
        {
          question: 'ما وسائل الدفع المتاحة؟',
          answer: 'وسائل الدفع تختلف حسب الدولة ومزوّد الدفع. ويمكن طلب فاتورة أو ترتيبات فوترة للشركات.',
        },
        {
          question: 'هل توجد سياسة استرداد؟',
          answer: 'نعم، شروط الاسترداد تعتمد على نوع التسجيل والتوقيت. راجع صفحة سياسة الاسترداد قبل الشراء.',
        },
      ]
    : [
        {
          question: 'How do I choose the right program?',
          answer: 'Start from your current role and target role. Then compare each program by outcomes, instructor profile, and weekly workload.',
        },
        {
          question: 'Do you provide certificates after completion?',
          answer: 'Yes. Certificates are issued after meeting attendance/completion requirements. For eligible tracks, you can verify certificates online.',
        },
        {
          question: 'Are there options for company teams?',
          answer: 'Yes. We offer team enrollment and custom learning tracks through our business solutions. Contact us for a tailored plan.',
        },
        {
          question: 'Can I switch between courses after enrollment?',
          answer: 'Switch rules depend on the program type and start date. Reach out to support before the first live session for the best options.',
        },
        {
          question: 'What payment methods are supported?',
          answer: 'Available methods depend on your location and checkout provider. You can also contact support for invoicing and corporate billing.',
        },
        {
          question: 'Is there a refund policy?',
          answer: 'Yes. Refund terms are defined by enrollment type and timing. Please review the policy page before purchasing.',
        },
      ];

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{isAr ? 'الدعم' : 'Support'}</p>
            <h1 className={styles.title}>{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h1>
            <p className={styles.subtitle}>
              {isAr
                ? 'إجابات سريعة حول التسجيل والشهادات وتدريب الفرق وآلية عمل المنصة.'
                : 'Quick answers about enrollment, certificates, team learning, and platform workflows.'}
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.faqList}>
              {faqItems.map((item) => (
                <details key={item.question} className={styles.item}>
                  <summary className={styles.question}>{item.question}</summary>
                  <p className={styles.answer}>{item.answer}</p>
                </details>
              ))}
            </div>

            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>{isAr ? 'ما زلت تحتاج مساعدة؟' : 'Still need help?'}</h2>
              <p className={styles.ctaText}>
                {isAr
                  ? 'تواصل مع فريق القبول والدعم للحصول على توجيه يناسب حالتك.'
                  : 'Contact admissions and support for tailored guidance.'}
              </p>
              <div className={styles.ctaActions}>
                <Link href={`/${locale}/contact`}>
                  <Button variant="primary">{isAr ? 'تواصل معنا' : 'Contact Us'}</Button>
                </Link>
                <Link href={`/${locale}/refund-policy`}>
                  <Button variant="secondary">{isAr ? 'سياسة الاسترداد' : 'Refund Policy'}</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
