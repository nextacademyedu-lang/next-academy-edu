'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from './promotional-banner.module.css';

/* ─── Types ────────────────────────────────────────────── */
interface BannerButton {
  id?: string;
  labelAr: string;
  labelEn?: string;
  link: string;
  variant?: 'solid' | 'outline' | 'ghost';
  color?: string;
  openInNewTab?: boolean;
}

interface BannerData {
  id: string | number;
  titleAr: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  image?: { url: string } | string | number;
  buttons?: BannerButton[];
  layout?: 'image_right' | 'image_left' | 'image_bg' | 'text_only';
  height?: 'auto' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor?: string;
  backgroundGradient?: string;
  textColor?: string;
  textAlign?: 'start' | 'center' | 'end';
  contentAlign?: 'start' | 'center' | 'end';
  overlayOpacity?: number;
  borderRadius?: number;
  autoPlaySpeed?: number;
  transition?: 'fade' | 'slide';
}

interface PromoBannerSlotProps {
  locale: string;
  page: string;
  position: string;
}

/* ─── Helper ───────────────────────────────────────────── */
function getImageUrl(img: BannerData['image']): string | null {
  if (!img) return null;
  if (typeof img === 'number') return null;
  if (typeof img === 'string') return img;
  return img.url || null;
}

/* ─── Main Component ───────────────────────────────────── */
export function PromoBannerSlot({ locale, page, position }: PromoBannerSlotProps) {
  const isAr = locale === 'ar';
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/promo-banners?page=${page}&position=${position}`);
        if (!res.ok) return;
        const data = await res.json();
        setBanners(data.banners || []);
      } catch { /* silent */ }
    };
    load();
  }, [page, position]);

  // Auto-play
  const autoSpeed = banners[0]?.autoPlaySpeed || 5000;
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length <= 1 || autoSpeed <= 0) return;
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % banners.length);
    }, autoSpeed);
  }, [banners.length, autoSpeed]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  if (banners.length === 0) return null;

  const transitionType = banners[0]?.transition || 'fade';

  const goTo = (idx: number) => {
    setCurrent(idx);
    startTimer(); // reset timer on manual nav
  };

  return (
    <section className={styles.slot}>
      <div className={styles.slotInner}>
        {banners.map((banner, idx) => (
          <BannerSlide
            key={banner.id}
            banner={banner}
            isAr={isAr}
            active={idx === current}
            transition={transitionType}
          />
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className={styles.dots}>
          {banners.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === current ? styles.dotActive : ''}`}
              onClick={() => goTo(idx)}
              aria-label={`Banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─── Single Banner Slide ──────────────────────────────── */
function BannerSlide({
  banner,
  isAr,
  active,
  transition,
}: {
  banner: BannerData;
  isAr: boolean;
  active: boolean;
  transition: string;
}) {
  const title = isAr ? banner.titleAr : (banner.titleEn || banner.titleAr);
  const subtitle = isAr ? banner.subtitleAr : (banner.subtitleEn || banner.subtitleAr);
  const imageUrl = getImageUrl(banner.image);
  const layout = banner.layout || 'image_right';
  const height = banner.height || 'auto';
  const bgColor = banner.backgroundColor || '#1a2e4a';
  const bgGradient = banner.backgroundGradient;
  const textColor = banner.textColor || '#ffffff';
  const textAlign = banner.textAlign || 'start';
  const contentAlign = banner.contentAlign || 'center';
  const overlayOpacity = banner.overlayOpacity ?? 60;
  const radius = banner.borderRadius ?? 24;
  const buttons = banner.buttons || [];

  const isImageBg = layout === 'image_bg';
  const isTextOnly = layout === 'text_only';
  const isImageLeft = layout === 'image_left';

  const containerStyle: React.CSSProperties = {
    background: bgGradient || bgColor,
    color: textColor,
    borderRadius: `${radius}px`,
    ...(height !== 'auto' ? { minHeight: `var(--banner-h-${height})` } : {}),
  };

  const contentStyle: React.CSSProperties = {
    textAlign: textAlign as any,
    alignItems: textAlign === 'center' ? 'center' : textAlign === 'end' ? 'flex-end' : 'flex-start',
    justifyContent: contentAlign,
  };

  const layoutClass = isImageBg
    ? styles.layoutBg
    : isTextOnly
    ? styles.layoutTextOnly
    : isImageLeft
    ? styles.layoutImageLeft
    : styles.layoutImageRight;

  const slideClass = `${styles.slide} ${active ? styles.slideActive : ''} ${transition === 'slide' ? styles.transSlide : styles.transFade}`;

  return (
    <div className={slideClass}>
      <div className={`${styles.container} ${layoutClass}`} style={containerStyle}>

        {/* Background image overlay */}
        {isImageBg && imageUrl && (
          <>
            <img src={imageUrl} alt="" className={styles.bgImage} />
            <div className={styles.bgOverlay} style={{ opacity: overlayOpacity / 100 }} />
          </>
        )}

        {/* Side image (left layout) */}
        {isImageLeft && imageUrl && (
          <div className={styles.imageWrap}>
            <img src={imageUrl} alt={title} className={styles.image} />
          </div>
        )}

        {/* Content */}
        <div className={styles.content} style={contentStyle}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {buttons.length > 0 && (
            <div className={styles.btnRow} style={{ justifyContent: textAlign === 'center' ? 'center' : textAlign === 'end' ? 'flex-end' : 'flex-start' }}>
              {buttons.map((btn, i) => {
                const label = isAr ? btn.labelAr : (btn.labelEn || btn.labelAr);
                const variant = btn.variant || 'solid';
                const color = btn.color || '#dc2626';
                const btnStyle: React.CSSProperties = variant === 'solid'
                  ? { background: color, color: '#fff', border: `2px solid ${color}` }
                  : variant === 'outline'
                  ? { background: 'transparent', color: textColor, border: `2px solid ${color}` }
                  : { background: 'transparent', color: textColor, border: 'none' };

                return (
                  <Link
                    key={btn.id || i}
                    href={btn.link}
                    className={styles.btn}
                    style={btnStyle}
                    target={btn.openInNewTab ? '_blank' : undefined}
                    rel={btn.openInNewTab ? 'noopener noreferrer' : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Side image (right layout) */}
        {!isImageBg && !isTextOnly && !isImageLeft && imageUrl && (
          <div className={styles.imageWrap}>
            <img src={imageUrl} alt={title} className={styles.image} />
          </div>
        )}
      </div>
    </div>
  );
}
