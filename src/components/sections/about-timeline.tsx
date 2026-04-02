"use client";

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-timeline.module.css';

const MILESTONES = [
  { key: 'milestone1', yearKey: 'milestone1Year' },
];

export function AboutTimeline() {
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
          <span className={styles.eyebrow}>{t('timelineEyebrow')}</span>
          <h2 className={styles.heading}>{t('timelineTitle')}</h2>
        </motion.div>

        <div className={styles.timeline}>
          <div className={styles.line} />

          {MILESTONES.map((milestone, i) => (
            <motion.div
              key={milestone.key}
              className={`${styles.item} ${i % 2 === 0 ? styles.itemLeft : styles.itemRight}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className={styles.dot}>
                <div className={styles.dotInner} />
              </div>
              <div className={styles.card}>
                <span className={styles.year}>{t(milestone.yearKey)}</span>
                <h3 className={styles.cardTitle}>{t(`${milestone.key}Title`)}</h3>
                <p className={styles.cardDesc}>{t(`${milestone.key}Desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
