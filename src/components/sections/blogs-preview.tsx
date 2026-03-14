'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import styles from './blogs-preview.module.css';

const MOCK_POSTS = [
  { id: '1', title: 'The Future of B2B Marketing in MENA', category: 'Marketing', excerpt: 'An analysis of how top tier startups are shifting budgets from paid Ads to high-value community events.', date: 'Oct 2, 2026' },
  { id: '2', title: 'How to Finance Your Seed Round Without Dilution', category: 'Finance', excerpt: 'Venture debt and non-dilutive capital are becoming the preferred vehicle for fast-growing SaaS companies.', date: 'Sep 28, 2026' },
  { id: '3', title: 'Why Culture Eats Strategy for Breakfast', category: 'Leadership', excerpt: 'A deep dive into building engineering teams that self-manage and deliver product velocity.', date: 'Sep 15, 2026' },
  { id: '4', title: 'Scaling Engineering In Remote Teams', category: 'Tech', excerpt: 'The systems and rituals required to keep distributed engineering teams aligned and shipping fast.', date: 'Sep 05, 2026' },
];

const ALL_POSTS = [...MOCK_POSTS, ...MOCK_POSTS.map(p => ({ ...p, id: p.id + '-copy' }))];

export function BlogsPreviewSection() {
  const t = useTranslations('Blogs');
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
          <div className={styles.actions}>
            <Link href="/blog" className={styles.viewAllWrapper}>
              <Button variant="outline" className={styles.viewAllBtn}>{t('viewAll')} &rarr;</Button>
            </Link>
          </div>
        </motion.div>

        <div className={styles.carouselWrapper}>
          <button className={`${styles.controlBtn} ${styles.prevBtn}`} onClick={scrollPrev} aria-label="Previous">←</button>
          <motion.div className={styles.embla} ref={emblaRef} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className={styles.embla__container}>
              {ALL_POSTS.map((post, index) => (
                <div key={post.id} className={`${styles.embla__slide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <Link href={`/blog/${post.id}`} className={styles.cardLink}>
                    <Card interactive className={styles.postCard}>
                      <div className={styles.postImage} />
                      <CardHeader className={styles.cardHeader}>
                        <Badge variant="outline" className={styles.categoryTag}>{post.category}</Badge>
                        <CardTitle className={styles.postTitle}>{post.title}</CardTitle>
                      </CardHeader>
                      <CardContent className={styles.cardContent}>
                        <p className={styles.postExcerpt}>{post.excerpt}</p>
                      </CardContent>
                      <CardFooter className={styles.cardFooter}>
                        <span className={styles.date}>{post.date}</span>
                        <span className={styles.readMore}>{t('readMore')}</span>
                      </CardFooter>
                    </Card>
                  </Link>
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
