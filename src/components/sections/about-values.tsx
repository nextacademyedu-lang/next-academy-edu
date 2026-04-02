"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-values.module.css';

const VALUE_ICONS: Record<string, React.ReactNode> = {
  value1: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  value2: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  value3: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  value4: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const VALUES = ['value1', 'value2', 'value3'] as const;

export function AboutValues() {
  const t = useTranslations('About');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.eyebrow}>{t('valuesEyebrow')}</span>
          <h2 className={styles.heading}>{t('valuesTitle')}</h2>
          <p className={styles.subheading}>{t('valuesSubtitle')}</p>
        </motion.div>

        <div className={styles.grid}>
          {VALUES.map((key, i) => (
            <motion.div
              key={key}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={styles.iconWrap}>
                {VALUE_ICONS[key]}
              </div>
              <h3 className={styles.cardTitle}>{t(`${key}Title`)}</h3>
              <p className={styles.cardDesc}>{t(`${key}Desc`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
