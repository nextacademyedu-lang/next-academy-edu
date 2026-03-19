"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import styles from './about-cta.module.css';

export function AboutCta() {
  const t = useTranslations('About');
  const locale = useLocale();

  return (
    <section className={styles.section}>
      <div className={styles.bgOrb1} />
      <div className={styles.bgOrb2} />

      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className={styles.heading}>{t('ctaTitle')}</h2>
          <p className={styles.subheading}>{t('ctaSubtitle')}</p>

          <div className={styles.actions}>
            <Link href={`/${locale}/programs`} className={styles.btnPrimary}>
              {t('ctaBtnPrimary')}
            </Link>
            <Link href={`/${locale}/contact`} className={styles.btnSecondary}>
              {t('ctaBtnSecondary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
