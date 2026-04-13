'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import styles from './footer.module.css';

export function Footer() {
  const t = useTranslations('Footer');
  const locale = useLocale();
  const socialLinks = [
    { label: 'LinkedIn', href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL || '' },
    { label: 'X / Twitter', href: process.env.NEXT_PUBLIC_SOCIAL_X_URL || '' },
    { label: 'Facebook', href: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || '' },
    { label: 'Instagram', href: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || '' },
  ].filter((item) => item.href.trim().length > 0);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandColumn}>
            <div className={styles.logoRow}>
              <div className={styles.logoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 22H22L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <span className={styles.brandName}>Next Academy</span>
            </div>
            <p className={styles.copyright}>
              &copy; {t('copyright')} Next Academy {new Date().getFullYear()}.
            </p>
          </div>

          <div className={styles.linksSection}>
            <div className={styles.column}>
              <h4 className={styles.heading}>{t('pages')}</h4>
              <Link href={`/${locale}/courses`}     className={styles.link}>{t('programs')}</Link>
              <Link href={`/${locale}/instructors`} className={styles.link}>{t('instructors')}</Link>
              <Link href={`/${locale}/about`}       className={styles.link}>{t('about')}</Link>
              <Link href={`/${locale}/contact`}     className={styles.link}>{t('contact')}</Link>
              <Link href={`/${locale}/blog`}        className={styles.link}>{t('blog')}</Link>
            </div>
            <div className={styles.column}>
              <h4 className={styles.heading}>{t('socials')}</h4>
              {socialLinks.length > 0 ? (
                socialLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={styles.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.label}
                  </Link>
                ))
              ) : (
                <span className={styles.link}>
                  {locale === 'ar' ? 'تتوفر الروابط قريباً' : 'Social links coming soon'}
                </span>
              )}
            </div>
            <div className={styles.column}>
              <h4 className={styles.heading}>{t('legal')}</h4>
              <Link href={`/${locale}/privacy`}       className={styles.link}>{t('privacy')}</Link>
              <Link href={`/${locale}/terms`}         className={styles.link}>{t('terms')}</Link>
              <Link href={`/${locale}/refund-policy`} className={styles.link}>{t('refund')}</Link>
              <Link href={`/${locale}/unsubscribe`} className={styles.link}>
                {locale === 'ar' ? 'إلغاء الاشتراك' : 'Unsubscribe'}
              </Link>
            </div>
            <div className={styles.column}>
              <h4 className={styles.heading}>{t('register')}</h4>
              <Link href={`/${locale}/register`}         className={styles.link}>{t('signup')}</Link>
              <Link href={`/${locale}/login`}            className={styles.link}>{t('login')}</Link>
              <Link href={`/${locale}/forgot-password`}  className={styles.link}>{t('forgotPassword')}</Link>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.watermarkContainer}>
        <span className={styles.watermarkText}>NEXTACADEMY</span>
      </div>
    </footer>
  );
}
