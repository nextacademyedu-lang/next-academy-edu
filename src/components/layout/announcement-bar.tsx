'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './announcement-bar.module.css';

interface BarData {
  id: string | number;
  textAr: string;
  textEn: string;
  barType: string;
  isDismissible: boolean;
  icon?: string;
  link?: {
    url?: string;
    textAr?: string;
    textEn?: string;
  };
  countdown?: {
    enabled?: boolean;
    endDate?: string;
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

export function AnnouncementBar({ locale }: AnnouncementBarProps) {
  const pathname = usePathname();
  const [bar, setBar] = useState<BarData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isAr = locale === 'ar';

  useEffect(() => {
    const fetchBar = async () => {
      try {
        const res = await fetch(`/api/announcement-bars/active?page=${encodeURIComponent(pathname)}`);
        if (!res.ok) return;
        const data = await res.json();
        const barData = data.bar as BarData | null;
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
  }, [pathname]);

  const countdown = useBarCountdown(
    bar?.countdown?.enabled ? bar.countdown.endDate : undefined,
  );

  const handleDismiss = useCallback(() => {
    if (bar) {
      sessionStorage.setItem(`${BAR_DISMISS_KEY}${bar.id}`, '1');
    }
    setDismissed(true);
  }, [bar]);

  if (!bar || dismissed) return null;

  const text = isAr ? bar.textAr : bar.textEn;
  const linkText = isAr ? bar.link?.textAr : bar.link?.textEn;

  const typeClass =
    bar.barType === 'warning'
      ? styles.barWarning
      : bar.barType === 'success'
        ? styles.barSuccess
        : bar.barType === 'promo'
          ? styles.barPromo
          : styles.barInfo;

  return (
    <AnimatePresence>
      <motion.div
        className={`${styles.bar} ${typeClass}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        role="alert"
      >
        <div className={styles.inner}>
          {bar.icon && <span className={styles.icon}>{bar.icon}</span>}

          <span className={styles.text}>
            {text}
            {countdown && (
              <>
                {' '}
                <span className={styles.countdown}>{countdown}</span>
              </>
            )}
            {bar.link?.url && linkText && (
              <>
                {' '}
                <a href={bar.link.url} className={styles.link}>
                  {linkText}
                </a>
              </>
            )}
          </span>

          {bar.isDismissible && (
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
