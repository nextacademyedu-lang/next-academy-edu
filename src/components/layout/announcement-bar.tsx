'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './announcement-bar.module.css';

interface AnnouncementMessage {
  textAr?: string;
  textEn?: string;
  linkUrl?: string;
  icon?: string;
}

interface AnnouncementBarData {
  id: string | number;
  messages?: AnnouncementMessage[];
  appearance?: {
    bgColor?: string;
    bgGradient?: string;
    textColor?: string;
    fontSize?: 'sm' | 'md' | 'lg';
  };
  ctaButton?: {
    hasCtaButton?: boolean;
    ctaText?: string;
    ctaLink?: string;
  };
  countdown?: {
    hasCountdown?: boolean;
    countdownTarget?: string;
  };
  behavior?: {
    isDismissible?: boolean;
    rememberDismiss?: boolean;
  };
}

interface AnnouncementBarProps {
  locale: string;
}

const BAR_DISMISS_KEY = 'na_bar_dismissed_';

function useBarCountdown(endDate: string | undefined) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!endDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(endDate).getTime() - Date.now());
      if (diff === 0) {
        setRemaining('');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return remaining;
}

function getFontSize(fontSize?: 'sm' | 'md' | 'lg'): string {
  if (fontSize === 'sm') return '12px';
  if (fontSize === 'lg') return '16px';
  return '14px';
}

export function AnnouncementBar({ locale }: AnnouncementBarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previewAnnouncementId = searchParams?.get('previewAnnouncementId') || '';
  const [bar, setBar] = useState<AnnouncementBarData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isAr = locale === 'ar';

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const params = new URLSearchParams({ page: pathname });
        if (previewAnnouncementId) {
          params.set('previewAnnouncementId', previewAnnouncementId);
        }

        const res = await fetch(`/api/announcement-bars/active?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const barData = data.bar as AnnouncementBarData | null;
        if (!barData) return;

        // Check if already dismissed this session
        const dismissKey = `${BAR_DISMISS_KEY}${barData.id}`;
        if (sessionStorage.getItem(dismissKey)) return;

        setBar(barData);
      } catch {
        /* silent */
      }
    };
    fetchBar();
  }, [pathname, previewAnnouncementId]);

  const countdown = useBarCountdown(
    bar?.countdown?.hasCountdown ? bar.countdown.countdownTarget : undefined,
  );

  const handleDismiss = useCallback(() => {
    if (bar && bar.behavior?.rememberDismiss !== false) {
      sessionStorage.setItem(`${BAR_DISMISS_KEY}${bar.id}`, '1');
    }
    setDismissed(true);
  }, [bar]);

  if (!bar || dismissed) return null;

  const firstMessage = bar.messages?.[0];
  const text = isAr ? firstMessage?.textAr : firstMessage?.textEn;
  const icon = firstMessage?.icon;
  const linkUrl = bar.ctaButton?.hasCtaButton ? bar.ctaButton.ctaLink : firstMessage?.linkUrl;
  const linkText = bar.ctaButton?.hasCtaButton
    ? bar.ctaButton.ctaText || (isAr ? 'تفاصيل' : 'Details')
    : isAr
      ? 'اعرف أكثر'
      : 'Learn more';
  const isDismissible = bar.behavior?.isDismissible !== false;
  const appearance = bar.appearance;
  const barStyle: React.CSSProperties = {
    background: appearance?.bgGradient || appearance?.bgColor || undefined,
    color: appearance?.textColor || undefined,
  };
  const textStyle: React.CSSProperties = {
    fontSize: getFontSize(appearance?.fontSize),
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.bar} ${styles.barInfo}`}
        style={barStyle}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="alert"
      >
        <div className={styles.inner}>
          {icon && <span className={styles.icon}>{icon}</span>}

          <span className={styles.text} style={textStyle}>
            {text}
            {countdown && (
              <>
                {' '}
                <span className={styles.countdown}>{countdown}</span>
              </>
            )}
            {linkUrl && linkText && (
              <>
                {' '}
                <a href={linkUrl} className={styles.link}>
                  {linkText}
                </a>
              </>
            )}
          </span>

          {isDismissible && (
            <button
              className={styles.dismissBtn}
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
