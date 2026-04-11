'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import styles from './instructors-preview.module.css';

type Instructor = {
  id: string;
  name: string;
  title: string;
  image: string | null;
  slug: string;
};

export function InstructorsPreview() {
  const t = useTranslations('Instructors');
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', loop: true, startIndex: 1, dragFree: true });
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch('/api/home/instructors');
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data?.instructors) ? data.instructors as Instructor[] : [];
        setInstructors(docs);
      } catch {
        // Keep component resilient
      } finally {
        setLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  // Duplicate items for seamless looping if we have any
  const displayInstructors = instructors.length > 0
    ? [...instructors, ...instructors.map(i => ({ ...i, id: i.id + '-copy' }))]
    : [];

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
    return () => { emblaApi.off('select', onSelect); emblaApi.off('reInit', onSelect); };
  }, [emblaApi, onSelect]);

  if (loading) return null;
  if (displayInstructors.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5 }}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t('title')} <span className={styles.highlight}>{t('titleHighlight')}</span></h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
          </div>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous">←</button>
          <motion.div className={styles.embla} ref={emblaRef} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className={styles.embla__container}>
              {displayInstructors.map((instructor, index) => (
                <div key={instructor.id} className={`${styles.embla__slide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <Link href={`/${locale}/instructors/${instructor.slug}`} className={styles.cardLink}>
                    <div className={styles.minimalCard}>
                      <div className={styles.imageContainer}>
                        {instructor.image ? (
                          <img src={instructor.image} alt={instructor.name} className={styles.instructorImage} />
                        ) : (
                          <div className={styles.instructorImage} style={{ background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--text-secondary)' }}>
                            {instructor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className={styles.infoContainer}>
                        <h3 className={styles.minimalName}>{instructor.name}</h3>
                        <p className={styles.minimalRole}>{instructor.title}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
          <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={scrollNext} aria-label="Next">→</button>
        </div>

        <motion.div className={styles.ctaContainer} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Link href={`/${locale}/instructors`}>
            <Button variant="secondary" size="lg">{t('seeAll')}</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
