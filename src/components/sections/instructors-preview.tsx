'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import styles from './instructors-preview.module.css';

const MOCK_INSTRUCTORS = [
  { id: '1', name: 'Dr. Sarah Chen', title: 'VP of Marketing @ TechCorp', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop' },
  { id: '2', name: 'James Rodriguez', title: 'Managing Partner @ FinVentures', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=600&auto=format&fit=crop' },
  { id: '3', name: 'Elena Rostova', title: 'Head of Product @ BuildIt', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop' },
  { id: '4', name: 'Dr. Abdelrahaman Kandil', title: 'Founder & CEO @ Next Academy', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop' },
];

const ALL_INSTRUCTORS = [...MOCK_INSTRUCTORS, ...MOCK_INSTRUCTORS.map(i => ({ ...i, id: i.id + '-copy' }))];

export function InstructorsPreview() {
  const t = useTranslations('Instructors');
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
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t('title')} <span className={styles.highlight}>{t('titleHighlight')}</span></h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
          </div>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous">←</button>
          <motion.div className={styles.embla} ref={emblaRef} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className={styles.embla__container}>
              {ALL_INSTRUCTORS.map((instructor, index) => (
                <div key={instructor.id} className={`${styles.embla__slide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <div className={styles.minimalCard}>
                    <div className={styles.imageContainer}>
                      <img src={instructor.image} alt={instructor.name} className={styles.instructorImage} />
                    </div>
                    <div className={styles.infoContainer}>
                      <h3 className={styles.minimalName}>{instructor.name}</h3>
                      <p className={styles.minimalRole}>{instructor.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <button className={`${styles.controlBtn} ${styles.nextBtn}`} onClick={scrollNext} aria-label="Next">→</button>
        </div>

        <motion.div className={styles.ctaContainer} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Link href="/instructors">
            <Button variant="secondary" size="lg">{t('seeAll')}</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
