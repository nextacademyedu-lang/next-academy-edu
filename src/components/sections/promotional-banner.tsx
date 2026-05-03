import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Media, PromotionalBanner as PromotionalBannerType } from '@/payload-types';
import styles from './promotional-banner.module.css';

export async function PromotionalBanner({ locale }: { locale: string }) {
  try {
    const payload = await getPayload({ config });
    const banner = await payload.findGlobal({
      slug: 'promotional-banner',
      depth: 1,
    }) as PromotionalBannerType;

    if (!banner || !banner.isActive) return null;

    const isAr = locale === 'ar';
    const title = isAr ? banner.titleAr : (banner.titleEn || banner.titleAr);
    const subtitle = isAr ? banner.subtitleAr : (banner.subtitleEn || banner.subtitleAr);
    const buttonText = isAr ? banner.buttonTextAr : (banner.buttonTextEn || banner.buttonTextAr);
    
    const imageUrl = banner.image && typeof banner.image === 'object' ? (banner.image as Media).url : null;
    const bgColor = banner.backgroundColor || '#1a2e4a';

    return (
      <section className={styles.section} style={{ backgroundColor: bgColor }}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {buttonText && banner.buttonLink && (
              <Link href={banner.buttonLink} className={styles.button}>
                {buttonText}
              </Link>
            )}
          </div>
          {imageUrl && (
            <div className={styles.imageWrap}>
              <Image 
                src={imageUrl} 
                alt={title || 'Promotional Banner'} 
                fill 
                className={styles.image} 
                unoptimized 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    return null;
  }
}
