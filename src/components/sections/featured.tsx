'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import styles from './featured.module.css';

type FeaturedProgram = {
  id: string;
  title: string;
  kind: string;
  category: string;
  enrolledCount: number;
  rating: number;
  ratingCount: number;
  instructor: string;
  date: string;
  price: string;
  image: string | null;
  href: string;
};

export function FeaturedPrograms() {
  const t = useTranslations('Featured');
  const locale = useLocale() as 'ar' | 'en';
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true, dragFree: true });
  const [programs, setPrograms] = useState<FeaturedProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  useEffect(() => {
    const fetchFeaturedPrograms = async () => {
      try {
        const res = await fetch(`/api/home/featured-programs?locale=${locale}`);
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data?.programs) ? data.programs as FeaturedProgram[] : [];
        setPrograms(docs);
      } catch {
        // Keep component resilient; empty list hides section
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPrograms();
  }, [locale]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: typeof emblaApi) => {
    if (api) setSelectedIndex(api.selectedScrollSnap());
  }, []);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const allPrograms = useMemo(
    () => [...programs, ...programs.map((item) => ({ ...item, id: `${item.id}-copy` }))],
    [programs],
  );

  if (loading) return null;
  if (programs.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
          </div>
          <Link href={`/${locale}/courses`} className={styles.viewAll}>
            {t('viewAll')} &rarr;
          </Link>
        </motion.div>

        <div className={styles.carouselWrap}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous">
            ←
          </button>

          <motion.div
            className={styles.embla}
            ref={emblaRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <div className={styles.emblaContainer}>
              {allPrograms.map((program, index) => (
                <div key={program.id} className={`${styles.emblaSlide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <article className={styles.programCard}>
                    <div className={styles.cover}>
                      <Image
                        src={program.image || '/images/about/hero-bg.png'}
                        alt={program.title}
                        fill
                        className={styles.coverImage}
                        sizes="(max-width: 768px) 280px, 340px"
                      />
                      <span className={styles.kindBadge}>
                        <span className={styles.kindDot} />
                        {program.kind}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.categoryRow}>
                        <span className={styles.category}>{program.category}</span>
                        <button className={styles.bookmarkBtn} aria-label="Save">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>

                      <p className={styles.meta}>
                        {program.enrolledCount.toLocaleString()} {t('enrolled')} •{' '}
                        {program.rating > 0 ? program.rating.toFixed(1) : t('noRating')} ★
                        {program.ratingCount > 0 ? ` (${program.ratingCount})` : ''}
                      </p>
                      <h3 className={styles.cardTitle}>{program.title}</h3>

                      <div className={styles.infoRows}>
                        <div className={styles.infoRow}>
                          <span>{t('instructor')}:</span>
                          <span>{program.instructor}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span>{t('date')}:</span>
                          <span>{program.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.price}>{program.price}</span>
                      <Link href={program.href}>
                        <Button variant="primary" size="sm">{t('bookNow')}</Button>
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </motion.div>

          <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={scrollNext} aria-label="Next">
            →
          </button>
        </div>
      </div>
    </section>
  );
}
