"use client";

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, animate, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-hero.module.css';

const STATS = [
  { key: 'stat1', value: 15000, suffix: '+' },
  { key: 'stat2', value: 500, suffix: '+' },
  { key: 'stat3', value: 120, suffix: '+' },
  { key: 'stat4', value: 98, suffix: '%' },
];

function AnimatedCounter({ from, to, suffix }: { from: number; to: number; suffix: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = Math.floor(value).toLocaleString() + suffix;
      },
    });

    return () => controls.stop();
  }, [from, to, suffix, isInView]);

  return <span ref={nodeRef} className={styles.statValue}>0</span>;
}

export function AboutHero() {
  const t = useTranslations('About');

  return (
    <section className={styles.section}>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/about/hero-bg.png"
          alt=""
          fill
          priority
          className={styles.bgImage}
          sizes="100vw"
        />
        <div className={styles.overlay} />
      </div>

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className={styles.title}>
            {t('heroTitle')}{' '}
            <span className={styles.highlight}>{t('heroHighlight')}</span>
          </h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            {t('heroSubtitle')}
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.statsStrip}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          {STATS.map((stat) => (
            <div key={stat.key} className={styles.statBlock}>
              <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix} />
              <span className={styles.statLabel}>{t(stat.key)}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollIndicator}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <div className={styles.scrollLine} />
      </motion.div>
    </section>
  );
}
