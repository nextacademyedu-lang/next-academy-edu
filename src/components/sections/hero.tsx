'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './hero.module.css';

export function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('Hero');
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);

  return (
    <section className={styles.hero} ref={containerRef}>
      <motion.div className={styles.mediaLayer} style={{ y: imageY }}>
        <Image
          src="/images/about/hero-bg.png"
          alt="Corporate learning hero"
          fill
          priority
          className={styles.heroImage}
          sizes="100vw"
        />
      </motion.div>

      <div className={styles.overlay} />
      <div className={styles.grain} />

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Badge variant="success" className={styles.badge}>{t('badge')}</Badge>
          </motion.div>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t('title')} <span className={styles.highlight}>{t('titleHighlight')}</span>
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href={`/${locale}/courses`}>
              <Button size="lg" variant="primary">{t('exploreCta')}</Button>
            </Link>
            <Link href={`/${locale}/for-business`}>
              <Button size="lg" variant="secondary">{t('businessCta')}</Button>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
