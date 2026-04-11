import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import styles from './catalog-page.module.css';

export type CatalogCard = {
  id: string;
  title: string;
  kind: string;
  category: string;
  enrolled: string;
  rating: string;
  instructor: string;
  schedule: string;
  price: string;
  href: string;
};

type CatalogPageProps = {
  locale: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: CatalogCard[];
};

export function CatalogPage({ locale, eyebrow, title, subtitle, cards }: CatalogPageProps) {
  const isAr = locale === 'ar';
  const browseLabel = isAr ? 'تصفح البرامج' : 'Browse Programs';
  const admissionsLabel = isAr ? 'تواصل مع فريق القبول' : 'Talk to Admissions';
  const instructorLabel = isAr ? 'المدرب' : 'Instructor';
  const dateLabel = isAr ? 'التاريخ' : 'Date';
  const enrolledLabel = isAr ? 'مسجل' : 'enrolled';
  const bookNowLabel = isAr ? 'احجز الآن' : 'Book Now';

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
            <div className={styles.actions}>
              <Link href={`/${locale}/courses`}>
                <Button variant="primary" size="md">{browseLabel}</Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button variant="secondary" size="md">{admissionsLabel}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.grid}>
              {cards.length === 0 ? (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '28px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {isAr
                    ? 'لا توجد ورش متاحة حالياً. يرجى العودة لاحقاً.'
                    : 'No workshops are available right now. Please check back soon.'}
                </div>
              ) : (
                cards.map((card) => (
                  <article key={card.id} className={styles.card}>
                    <div className={styles.cover}>
                      <span className={styles.kindBadge}>{card.kind}</span>
                    </div>
                    <div className={styles.body}>
                      <span className={styles.category}>{card.category}</span>
                      <p className={styles.meta}>{card.enrolled} {enrolledLabel} • {card.rating} ★</p>
                      <h2 className={styles.cardTitle}>{card.title}</h2>
                      <div className={styles.info}>
                        <div className={styles.infoRow}>
                          <span>{instructorLabel}:</span>
                          <span>{card.instructor}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span>{dateLabel}:</span>
                          <span>{card.schedule}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.footer}>
                      <span className={styles.price}>{card.price}</span>
                      <Link href={card.href}>
                        <Button variant="primary" size="sm">{bookNowLabel}</Button>
                      </Link>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
