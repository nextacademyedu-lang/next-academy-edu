'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './featured.module.css';

const MOCK_PROGRAMS = [
  { id: '1', title: 'Advanced Strategic Marketing', type: 'Workshop', instructor: 'Dr. Sarah Chen', date: 'Oct 15 - Oct 17', price: '$850', tags: ['B2B', 'Marketing'] },
  { id: '2', title: 'Financial Modeling for Startups', type: 'Course', instructor: 'James Rodriguez', date: 'Nov 01 - Dec 15', price: '$1200', tags: ['Finance', 'Strategy'] },
  { id: '3', title: 'Leadership in Tech', type: 'Workshop', instructor: 'Elena Rostova', date: 'Nov 10', price: '$450', tags: ['Leadership', 'Tech'] },
  { id: '4', title: 'B2B Sales Acceleration', type: 'Course', instructor: 'Amir T.', date: 'Dec 05 - Jan 10', price: '$950', tags: ['Sales', 'B2B'] },
];

const ALL_PROGRAMS = [...MOCK_PROGRAMS, ...MOCK_PROGRAMS.map(p => ({ ...p, id: p.id + '-copy' }))];

export function FeaturedPrograms() {
  const t = useTranslations('Featured');
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', loop: true, startIndex: 1, dragFree: true });
  const [selectedIndex, setSelectedIndex] = React.useState(1);

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

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5 }}>
          <div>
            <h2 className={styles.title}>{t('title')}</h2>
            <Link href="/programs" className={styles.viewAll}>{t('viewAll')} &rarr;</Link>
          </div>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous">←</button>
          <motion.div className={styles.embla} ref={emblaRef} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className={styles.embla__container}>
              {ALL_PROGRAMS.map((program, index) => (
                <div key={program.id} className={`${styles.embla__slide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <Card interactive className={styles.card}>
                    <div className={styles.imageSlot}>
                      <Badge variant="default" className={styles.typeBadge}>{program.type}</Badge>
                    </div>
                    <CardHeader className={styles.cardHeader}>
                      <div className={styles.tags}>
                        {program.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                      </div>
                      <CardTitle className={styles.cardTitle}>{program.title}</CardTitle>
                    </CardHeader>
                    <CardContent className={styles.cardContent}>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('instructor')}:</span>
                        <span className={styles.infoValue}>{program.instructor}</span>
                      </div>
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>{t('date')}:</span>
                        <span className={styles.infoValue}>{program.date}</span>
                      </div>
                    </CardContent>
                    <CardFooter className={styles.cardFooter}>
                      <span className={styles.price}>{program.price}</span>
                      <Link href={`/programs/${program.id}`}>
                        <Button variant="primary" size="sm">{t('bookNow')}</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </motion.div>
          <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={scrollNext} aria-label="Next">→</button>
        </div>
      </div>
    </section>
  );
}
