'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './hero.module.css';

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const t = useTranslations('Hero');

  return (
    <section className={styles.hero} ref={containerRef}>
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Badge variant="success" className={styles.badge}>{t('badge')}</Badge>
          </motion.div>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            {t('title')} <span className={styles.highlight}>{t('titleHighlight')}</span>
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          >
            {t('subtitle')}
          </motion.p>
          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          >
            <Button size="lg" variant="primary">{t('exploreCta')}</Button>
            <Button size="lg" variant="secondary">{t('businessCta')}</Button>
          </motion.div>
        </motion.div>

        <div className={styles.visual}>
          <motion.div className={styles.imagePlaceholder} style={{ y }}>
            <div className={styles.glowEffect} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
