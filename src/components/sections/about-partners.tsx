"use client";

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-partners.module.css';

const PARTNER_NAMES = [
  'Microsoft', 'Google', 'AWS', 'Cisco', 'IBM',
  'Oracle', 'SAP', 'Salesforce', 'Adobe', 'Meta',
];

export function AboutPartners() {
  const t = useTranslations('About');

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.eyebrow}>{t('partnersEyebrow')}</span>
          <h2 className={styles.heading}>{t('partnersTitle')}</h2>
        </motion.div>
      </div>

      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          {[...PARTNER_NAMES, ...PARTNER_NAMES].map((name, i) => (
            <div key={`${name}-${i}`} className={styles.partnerChip}>
              <span className={styles.partnerName}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
