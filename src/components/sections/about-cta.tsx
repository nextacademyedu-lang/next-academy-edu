"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import styles from './about-cta.module.css';

export function AboutCta() {
  const t = useTranslations('About');
  const locale = useLocale();
  const whatsappLink = 'https://wa.me/201000000000';

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
            <a
              href={whatsappLink}
              className={styles.btnPrimary}
              target="_blank"
              rel="noreferrer"
              aria-label={t('ctaBtnPrimary')}
            >
              <span className={styles.btnIcon} aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M20.52 3.48A11.78 11.78 0 0012 0 11.98 11.98 0 001.64 17.3L0 24l6.86-1.8A11.92 11.92 0 0012 24c3.2 0 6.2-1.24 8.46-3.5A11.9 11.9 0 0024 12c0-3.2-1.24-6.2-3.48-8.52zM12 21.94a9.87 9.87 0 01-5.02-1.37l-.36-.2-4.07 1.07 1.08-3.97-.24-.38A9.93 9.93 0 0112 2.06c2.66 0 5.16 1.04 7.04 2.9A9.9 9.9 0 0121.94 12c0 2.66-1.04 5.16-2.9 7.04A9.93 9.93 0 0112 21.94zm5.7-7.49c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.36.22-.66.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.47.14-.62.14-.14.3-.36.44-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.54-.07-.15-.68-1.64-.94-2.26-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.54.07-.82.38-.28.3-1.08 1.06-1.08 2.58 0 1.52 1.1 2.98 1.26 3.2.15.2 2.16 3.3 5.24 4.62.73.32 1.3.5 1.74.64.73.23 1.4.2 1.92.12.58-.08 1.78-.72 2.04-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35z" />
                </svg>
              </span>
              {t('ctaBtnPrimary')}
            </a>
            <Link href={`/${locale}/contact`} className={styles.btnSecondary}>
              {t('ctaBtnSecondary')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
