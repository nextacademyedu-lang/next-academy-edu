'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './popup-modal.module.css';

interface PopupData {
  id: string | number;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: string;
  design?: {
    backgroundColor?: string;
    textColor?: string;
    image?: { url: string } | string;
  };
  content?: {
    ctaTextAr?: string;
    ctaTextEn?: string;
    ctaUrl?: string;
    promoCode?: string;
    countdownEnd?: string;
  };
}

interface PopupModalProps {
  popup: PopupData;
  locale: string;
  onClose: () => void;
}

function useCountdown(targetDate: string | undefined) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return remaining;
}

export function PopupModal({ popup, locale, onClose }: PopupModalProps) {
  const t = useTranslations('Popup');
  const isAr = locale === 'ar';

  const title = isAr ? popup.titleAr : popup.titleEn;
  const description = isAr ? popup.descriptionAr : popup.descriptionEn;
  const ctaText = isAr ? popup.content?.ctaTextAr : popup.content?.ctaTextEn;
  const rawImage = popup.design?.image;
  const imageUrl = rawImage
    ? (typeof rawImage === 'string' ? rawImage : rawImage.url)
    : undefined;

  const countdown = useCountdown(popup.content?.countdownEnd);
  const hasCountdown = Boolean(popup.content?.countdownEnd);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            backgroundColor: popup.design?.backgroundColor || undefined,
            color: popup.design?.textColor || undefined,
          }}
        >
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t('close')}
          >
            ✕
          </button>

          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className={styles.image}
              loading="lazy"
            />
          )}

          <div className={styles.body}>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}

            {/* Countdown */}
            {hasCountdown && (
              <div className={styles.countdown}>
                {[
                  { v: countdown.d, l: t('days') },
                  { v: countdown.h, l: t('hours') },
                  { v: countdown.m, l: t('minutes') },
                  { v: countdown.s, l: t('seconds') },
                ].map(({ v, l }) => (
                  <div className={styles.countdownUnit} key={l}>
                    <span className={styles.countdownValue}>{String(v).padStart(2, '0')}</span>
                    <span className={styles.countdownLabel}>{l}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Promo Code */}
            {popup.content?.promoCode && (
              <div className={styles.promo}>
                <span className={styles.promoCode}>{popup.content.promoCode}</span>
              </div>
            )}

            {/* CTA */}
            {popup.content?.ctaUrl && ctaText && (
              <a href={popup.content.ctaUrl} className={styles.ctaBtn}>
                {ctaText}
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
