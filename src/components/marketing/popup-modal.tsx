'use client';

import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import styles from './popup-modal.module.css';

/* ── Types ─────────────────────────────────────────────── */

interface PopupContent {
  titleAr?: string;
  titleEn?: string;
  badgeAr?: string;
  badgeEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  descriptionAr?: { root?: { children?: unknown[] } };
  descriptionEn?: { root?: { children?: unknown[] } };
  legalNoteAr?: string;
  legalNoteEn?: string;
  image?: { url?: string; alt?: string } | string;
  imagePosition?: 'top' | 'left' | 'right' | 'none';
}

interface PopupCta {
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

interface PopupPromo {
  hasPromoCode?: boolean;
  promoCode?: string;
  promoDelivery?: 'show_directly' | 'after_form' | 'send_email';
}

interface PopupFormField {
  fieldLabel: string;
  fieldType: 'email' | 'text' | 'phone' | 'name';
  isRequired?: boolean;
}

interface PopupForm {
  hasForm?: boolean;
  formFields?: PopupFormField[];
  successMessage?: string;
  redirectUrl?: string;
}

interface PopupAppearance {
  stylePreset?: 'default' | 'offer_dark';
  popupType?: 'modal' | 'slide_in' | 'bottom_bar' | 'full_screen';
  animation?: 'fade' | 'slide_up' | 'slide_side' | 'zoom';
  overlayDarkness?: number;
  closeOnOutsideClick?: boolean;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  backgroundImage?: { url?: string; alt?: string } | string;
  backgroundOverlayOpacity?: number;
  borderColor?: string;
  badgeBgColor?: string;
  badgeTextColor?: string;
}

interface PopupCountdown {
  hasCountdown?: boolean;
  countdownTarget?: string;
}

export interface PopupData {
  id: string | number;
  name: string;
  content?: PopupContent;
  cta?: PopupCta;
  promo?: PopupPromo;
  form?: PopupForm;
  appearance?: PopupAppearance;
  countdown?: PopupCountdown;
}

interface PopupModalProps {
  popup: PopupData;
  onClose: () => void;
  onLeadCaptured?: () => void;
}

/* ── Animation Variants ────────────────────────────────── */

const getAnimationVariants = (animation?: string, popupType?: string) => {
  const base = { opacity: 0 };
  const visible = { opacity: 1 };

  switch (animation) {
    case 'slide_up':
      return {
        initial: { ...base, y: popupType === 'bottom_bar' ? 100 : 60 },
        animate: { ...visible, y: 0 },
        exit: { ...base, y: popupType === 'bottom_bar' ? 100 : 60 },
      };
    case 'slide_side':
      return {
        initial: { ...base, x: popupType === 'slide_in' ? 120 : 60 },
        animate: { ...visible, x: 0 },
        exit: { ...base, x: popupType === 'slide_in' ? 120 : 60 },
      };
    case 'zoom':
      return {
        initial: { ...base, scale: 0.8 },
        animate: { ...visible, scale: 1 },
        exit: { ...base, scale: 0.8 },
      };
    default: // fade
      return {
        initial: base,
        animate: visible,
        exit: base,
      };
  }
};

/* ── Countdown Hook ────────────────────────────────────── */

function useCountdown(target?: string) {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!target) return;
    const targetDate = new Date(target).getTime();

    const calc = () => {
      const diff = Math.max(0, targetDate - Date.now());
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return remaining;
}

/* ── Rich Text Renderer ────────────────────────────────── */

function renderRichText(doc: { root?: { children?: unknown[] } } | undefined): React.ReactNode {
  if (!doc?.root?.children) return null;

  const renderNode = (node: Record<string, unknown>, idx: number): React.ReactNode => {
    if (node.type === 'text') {
      let el: React.ReactNode = node.text as string;
      if (node.bold) el = <strong key={idx}>{el}</strong>;
      if (node.italic) el = <em key={idx}>{el}</em>;
      return el;
    }
    const children = Array.isArray(node.children)
      ? (node.children as Record<string, unknown>[]).map((c, i) => renderNode(c, i))
      : null;

    switch (node.type) {
      case 'paragraph': return <p key={idx}>{children}</p>;
      case 'heading': return React.createElement(`h${node.tag || 3}`, { key: idx }, children);
      case 'link': return <a key={idx} href={node.url as string} target="_blank" rel="noopener noreferrer">{children}</a>;
      case 'listitem': return <li key={idx}>{children}</li>;
      case 'list': return node.listType === 'number' ? <ol key={idx}>{children}</ol> : <ul key={idx}>{children}</ul>;
      default: return <div key={idx}>{children}</div>;
    }
  };

  return (doc.root.children as Record<string, unknown>[]).map((n, i) => renderNode(n, i));
}

/* ── Component ─────────────────────────────────────────── */

export function PopupModal({ popup, onClose, onLeadCaptured }: PopupModalProps) {
  const locale = useLocale();
  const t = useTranslations('Popup');
  const isAr = locale === 'ar';

  const { content, cta, promo, form, appearance, countdown } = popup;
  const popupType = appearance?.popupType || 'modal';
  const stylePreset = appearance?.stylePreset || 'default';
  const animation = appearance?.animation || 'fade';
  const overlayDarkness = appearance?.overlayDarkness ?? 50;
  const closeOnOutside = appearance?.closeOnOutsideClick ?? true;
  const bgColor = appearance?.bgColor || '#1a1a2e';
  const textColor = appearance?.textColor || '#ffffff';
  const accentColor = appearance?.accentColor || '#e94560';
  const borderColor = appearance?.borderColor || 'transparent';
  const badgeBgColor = appearance?.badgeBgColor || '#117fb2';
  const badgeTextColor = appearance?.badgeTextColor || '#ffffff';
  const backgroundOverlayOpacity = appearance?.backgroundOverlayOpacity ?? 62;
  const backgroundImageUrl = typeof appearance?.backgroundImage === 'object'
    ? appearance.backgroundImage?.url
    : undefined;

  const title = isAr ? content?.titleAr : content?.titleEn;
  const badge = isAr ? content?.badgeAr : content?.badgeEn;
  const subtitle = isAr ? content?.subtitleAr : content?.subtitleEn;
  const description = isAr ? content?.descriptionAr : content?.descriptionEn;
  const legalNote = isAr ? content?.legalNoteAr : content?.legalNoteEn;
  const imageUrl = typeof content?.image === 'object' ? content.image?.url : undefined;
  const imageAlt = typeof content?.image === 'object' ? content.image?.alt : '';
  const imagePosition = content?.imagePosition || 'top';

  const remaining = useCountdown(countdown?.hasCountdown ? countdown.countdownTarget : undefined);

  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const canShowOfferPromoBox = Boolean(
    stylePreset === 'offer_dark' &&
    promo?.hasPromoCode &&
    promo?.promoCode &&
    (promo.promoDelivery !== 'after_form' || submitted),
  );

  const variants = getAnimationVariants(animation, popupType);

  /* Copy promo code */
  const handleCopy = useCallback(() => {
    if (promo?.promoCode) {
      navigator.clipboard.writeText(promo.promoCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [promo?.promoCode]);

  /* Form submit */
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('popup-email');

    if (typeof email === 'string' && email.trim()) {
      onLeadCaptured?.();
    }

    setSubmitted(true);
    if (form?.redirectUrl) {
      setTimeout(() => {
        window.location.href = form.redirectUrl as string;
      }, 1500);
    }
  }, [form?.redirectUrl, onLeadCaptured]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Overlay click */
  const handleOverlayClick = useCallback(() => {
    if (closeOnOutside) onClose();
  }, [closeOnOutside, onClose]);

  /* Determine modal class */
  const modalClass = [
    styles.modal,
    stylePreset === 'offer_dark' ? styles.offerDark : '',
    popupType === 'slide_in' ? styles.slideIn : '',
    popupType === 'bottom_bar' ? styles.bottomBar : '',
    popupType === 'full_screen' ? styles.fullScreen : '',
    imagePosition === 'left' || imagePosition === 'right' ? styles.imageSide : '',
  ].filter(Boolean).join(' ');

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        style={{ background: `rgba(0,0,0,${overlayDarkness / 100})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleOverlayClick}
      >
        <motion.div
          className={modalClass}
          style={{ backgroundColor: bgColor, color: textColor, borderColor }}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title || popup.name}
        >
          {stylePreset === 'offer_dark' && backgroundImageUrl && (
            <>
              <img
                src={backgroundImageUrl}
                alt=""
                aria-hidden="true"
                className={styles.offerBgImage}
              />
              <div
                className={styles.offerBgOverlay}
                style={{ background: `rgba(0, 0, 0, ${backgroundOverlayOpacity / 100})` }}
              />
            </>
          )}

          {/* Close button */}
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('close')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4L14 14M14 4L4 14" />
            </svg>
          </button>

          {/* Image - Top */}
          {imageUrl && imagePosition === 'top' && (
            <img src={imageUrl} alt={imageAlt || ''} className={styles.imageTop} />
          )}

          {/* Image - Side (left) */}
          {imageUrl && imagePosition === 'left' && (
            <img
              src={imageUrl}
              alt={imageAlt || ''}
              className={styles.sideImage}
              style={{ order: isAr ? 1 : 0 }}
            />
          )}

          <div className={styles.content}>
            {stylePreset === 'offer_dark' && badge && (
              <div
                className={styles.offerBadge}
                style={{ backgroundColor: badgeBgColor, color: badgeTextColor }}
              >
                {badge}
              </div>
            )}

            {/* Title */}
            {title && <h2 className={styles.title}>{title}</h2>}

            {/* Subtitle */}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

            {/* Description */}
            {description && (
              <div className={styles.description}>
                {renderRichText(description)}
              </div>
            )}

            {/* Countdown */}
            {countdown?.hasCountdown && countdown.countdownTarget && (
              <div className={styles.countdown}>
                {remaining.d > 0 && (
                  <div className={styles.countdownUnit}>
                    <span className={styles.countdownValue} style={{ color: accentColor }}>{remaining.d}</span>
                    <span className={styles.countdownLabel}>{t('days')}</span>
                  </div>
                )}
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownValue} style={{ color: accentColor }}>{remaining.h}</span>
                  <span className={styles.countdownLabel}>{t('hours')}</span>
                </div>
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownValue} style={{ color: accentColor }}>{remaining.m}</span>
                  <span className={styles.countdownLabel}>{t('minutes')}</span>
                </div>
                <div className={styles.countdownUnit}>
                  <span className={styles.countdownValue} style={{ color: accentColor }}>{remaining.s}</span>
                  <span className={styles.countdownLabel}>{t('seconds')}</span>
                </div>
              </div>
            )}

            {/* Promo Code */}
            {stylePreset !== 'offer_dark' && promo?.hasPromoCode && promo.promoCode && promo.promoDelivery === 'show_directly' && !form?.hasForm && (
              <div className={styles.promoCode}>
                <div>
                  <span className={styles.promoLabel}>{t('promoLabel')}</span>
                  <span className={styles.code}>{promo.promoCode}</span>
                </div>
                <button className={styles.copyBtn} onClick={handleCopy}>
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
            )}

            {/* Form */}
            {form?.hasForm && !submitted && (
              <form className={styles.form} onSubmit={handleSubmit}>
                {form.formFields?.map((field, idx) => (
                  <input
                    key={idx}
                    className={styles.input}
                    name={field.fieldType === 'email' ? 'popup-email' : `popup-${field.fieldType}-${idx}`}
                    type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
                    placeholder={field.fieldLabel}
                    required={field.isRequired}
                    dir="auto"
                  />
                ))}
                <button
                  type="submit"
                  className={styles.submitBtn}
                  style={{ backgroundColor: accentColor, color: textColor }}
                >
                  {t('submit')}
                </button>
              </form>
            )}

            {/* Form success */}
            {form?.hasForm && submitted && (
              <div className={styles.successMsg}>
                {form.successMessage || t('thankYou')}
                {/* Show promo code after form submit if configured */}
                {stylePreset !== 'offer_dark' && promo?.hasPromoCode && promo.promoCode && promo.promoDelivery === 'after_form' && (
                  <div className={styles.promoCode} style={{ marginTop: 16 }}>
                    <div>
                      <span className={styles.promoLabel}>{t('promoLabel')}</span>
                      <span className={styles.code}>{promo.promoCode}</span>
                    </div>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                      {copied ? t('copied') : t('copy')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Promo Code Box */}
            {canShowOfferPromoBox && (
              <div className={styles.offerPromoBox}>
                <span className={styles.promoLabel}>{t('promoLabel')}</span>
                <span className={styles.offerPromoCode}>{promo?.promoCode}</span>
              </div>
            )}

            {/* CTA Buttons (only if no form, or form already submitted) */}
            {(!form?.hasForm || submitted) && (cta?.primaryCtaText || cta?.secondaryCtaText) && (
              <div className={styles.ctaRow}>
                {cta?.primaryCtaText && cta?.primaryCtaLink && (
                  <a
                    href={cta.primaryCtaLink}
                    className={styles.primaryCta}
                    style={{ backgroundColor: accentColor, color: textColor }}
                  >
                    {cta.primaryCtaText}
                  </a>
                )}
                {cta?.secondaryCtaText && cta?.secondaryCtaLink && (
                  <a href={cta.secondaryCtaLink} className={styles.secondaryCta}>
                    {cta.secondaryCtaText}
                  </a>
                )}
              </div>
            )}

            {stylePreset === 'offer_dark' && legalNote && (
              <p className={styles.legalNote}>{legalNote}</p>
            )}
          </div>

          {/* Image - Side (right) */}
          {imageUrl && imagePosition === 'right' && (
            <img
              src={imageUrl}
              alt={imageAlt || ''}
              className={styles.sideImage}
              style={{ order: isAr ? 0 : 1 }}
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
