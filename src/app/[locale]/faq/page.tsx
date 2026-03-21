import React from 'react';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import styles from './page.module.css';

const FAQ_ITEMS = [
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

export default async function FaqPage() {
  const locale = await getLocale();

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>Support</p>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
              Quick answers about enrollment, certificates, team learning, and platform workflows.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.faqList}>
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className={styles.item}>
                  <summary className={styles.question}>{item.question}</summary>
                  <p className={styles.answer}>{item.answer}</p>
                </details>
              ))}
            </div>

            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>Still need help?</h2>
              <p className={styles.ctaText}>Contact admissions and support for tailored guidance.</p>
              <div className={styles.ctaActions}>
                <Link href={`/${locale}/contact`}>
                  <Button variant="primary">Contact Us</Button>
                </Link>
                <Link href={`/${locale}/refund-policy`}>
                  <Button variant="secondary">Refund Policy</Button>
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
