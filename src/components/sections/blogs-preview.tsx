'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import styles from './blogs-preview.module.css';

type BlogPost = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  slug: string;
  image: string | null;
};

export function BlogsPreviewSection() {
  const t = useTranslations('Blogs');
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', loop: true, startIndex: 1, dragFree: true });
  const [selectedIndex, setSelectedIndex] = React.useState(1);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/home/blog-posts');
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data?.posts) ? data.posts as BlogPost[] : [];
        setPosts(docs);
      } catch {
        // Keep component resilient
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Duplicate items for seamless looping
  const displayPosts = posts.length > 0
    ? [...posts, ...posts.map(p => ({ ...p, id: p.id + '-copy' }))]
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
  if (displayPosts.length === 0) return null;

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
              {displayPosts.map((post, index) => (
                <div key={post.id} className={`${styles.embla__slide} ${index === selectedIndex ? styles.activeSlide : ''}`}>
                  <Link href={`/blog/${post.slug}`} className={styles.cardLink}>
                    <Card interactive className={styles.postCard}>
                      {post.image ? (
                        <div className={styles.postImage} style={{ backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : (
                        <div className={styles.postImage} />
                      )}
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
