'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import styles from './cookie-consent.module.css';

export function CookieConsent() {
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (e) {
      // Storage unavailable or in private mode
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('cookie-consent', 'accepted');
      setIsVisible(false);
      // Dispatch custom event for other listeners (like source-tracking)
      window.dispatchEvent(new CustomEvent('cookie-consent-accepted'));
    } catch (e) {
      setIsVisible(false);
    }
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('cookie-consent', 'declined');
      setIsVisible(false);
    } catch (e) {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  const content = {
    ar: {
      text: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتتبع مصادر الزيارات. ',
      privacy: 'سياسة الخصوصية',
      accept: 'قبول الكل',
      decline: 'رفض',
    },
    en: {
      text: 'We use cookies to improve your experience and track traffic sources. ',
      privacy: 'Privacy Policy',
      accept: 'Accept All',
      decline: 'Decline',
    },
  }[locale as 'ar' | 'en'] || {
    text: 'We use cookies to improve your experience and track traffic sources. ',
    privacy: 'Privacy Policy',
    accept: 'Accept All',
    decline: 'Decline',
  };

  return (
    <div className={styles.banner} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.text}>
            {content.text}
            <Link href={`/${locale}/privacy`} className={styles.link}>
              {content.privacy}
            </Link>
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={handleDecline} className={`${styles.button} ${styles.decline}`}>
            {content.decline}
          </button>
          <button onClick={handleAccept} className={`${styles.button} ${styles.accept}`}>
            {content.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
