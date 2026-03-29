'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
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

type FeaturedResponse = {
  upcomingPrograms: FeaturedProgram[];
  recordedPrograms: FeaturedProgram[];
};

type CarouselProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  programs: FeaturedProgram[];
  instructorLabel: string;
  dateLabel: string;
  enrolledLabel: string;
  noRatingLabel: string;
};

function ProgramsCarousel({
  title,
  subtitle,
  ctaLabel,
  programs,
  instructorLabel,
  dateLabel,
  enrolledLabel,
  noRatingLabel,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true, dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: typeof emblaApi) => {
    if (api) setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!programs.length) return null;

  return (
    <div className={styles.groupBlock}>
      <div className={styles.groupHeader}>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

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
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className={styles.emblaContainer}>
            {programs.map((program, index) => (
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
                    </div>

                    <p className={styles.meta}>
                      {program.enrolledCount.toLocaleString()} {enrolledLabel} •{' '}
                      {program.rating > 0 ? program.rating.toFixed(1) : noRatingLabel} ★
                      {program.ratingCount > 0 ? ` (${program.ratingCount})` : ''}
                    </p>
                    <h3 className={styles.cardTitle}>{program.title}</h3>

                    <div className={styles.infoRows}>
                      <div className={styles.infoRow}>
                        <span>{instructorLabel}:</span>
                        <span>{program.instructor}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span>{dateLabel}:</span>
                        <span>{program.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.price}>{program.price}</span>
                    <Link href={program.href} className={styles.cardActionLink}>
                      {ctaLabel}
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
  );
}

export function FeaturedPrograms() {
  const t = useTranslations('Featured');
  const locale = useLocale() as 'ar' | 'en';
  const [data, setData] = useState<FeaturedResponse>({
    upcomingPrograms: [],
    recordedPrograms: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedPrograms = async () => {
      try {
        const res = await fetch(`/api/home/featured-programs?locale=${locale}`);
        if (!res.ok) return;
        const payload = await res.json();
        setData({
          upcomingPrograms: Array.isArray(payload?.upcomingPrograms) ? payload.upcomingPrograms : [],
          recordedPrograms: Array.isArray(payload?.recordedPrograms) ? payload.recordedPrograms : [],
        });
      } catch {
        // keep silent
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPrograms();
  }, [locale]);

  if (loading) return null;
  if (!data.upcomingPrograms.length && !data.recordedPrograms.length) return null;

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

        <ProgramsCarousel
          title={t('upcomingTitle')}
          subtitle={t('upcomingSubtitle')}
          ctaLabel={t('bookNow')}
          programs={data.upcomingPrograms}
          instructorLabel={t('instructor')}
          dateLabel={t('date')}
          enrolledLabel={t('enrolled')}
          noRatingLabel={t('noRating')}
        />

        <ProgramsCarousel
          title={t('recordedTitle')}
          subtitle={t('recordedSubtitle')}
          ctaLabel={t('watchRecording')}
          programs={data.recordedPrograms}
          instructorLabel={t('instructor')}
          dateLabel={t('date')}
          enrolledLabel={t('enrolled')}
          noRatingLabel={t('noRating')}
        />
      </div>
    </section>
  );
}
