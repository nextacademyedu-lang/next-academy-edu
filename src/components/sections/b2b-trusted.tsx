import React from 'react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import styles from './b2b-trusted.module.css';

type PartnerLogo = {
  name?: string;
  logo?: {
    url?: string;
    alt?: string;
  } | null;
};

const FALLBACK_LIST = [
  'Microsoft', 'Google', 'Amazon', 'Meta', 'Netflix',
  'Stripe', 'Spotify', 'Uber', 'Airbnb', 'Salesforce',
  'Adobe', 'Oracle', 'Shopify', 'Paypal', 'Intel',
];

async function fetchPartners(): Promise<PartnerLogo[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
  const url = new URL('/api/partners', baseUrl);
  url.searchParams.set('where[isActive][equals]', 'true');
  url.searchParams.set('sort', 'orderIndex');
  url.searchParams.set('depth', '1');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.docs) ? data.docs : [];
  } catch {
    return [];
  }
}

export async function B2BTrustedSection() {
  const t = await getTranslations('B2B');
  const partners = await fetchPartners();
  const items: PartnerLogo[] = partners.length
    ? partners
    : FALLBACK_LIST.map((name) => ({ name, logo: null }));
  const col1 = [...items.slice(0, 5), ...items.slice(0, 5)];
  const col2 = [...items.slice(5, 10), ...items.slice(5, 10)];
  const col3 = [...items.slice(10, 15), ...items.slice(10, 15)];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.title}>
            {t('title')} <span className={styles.highlight}>{t('titleHighlight')}</span>
          </h2>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        <div className={styles.marqueeContainer}>
          <div className={styles.fadeOverlayTop}></div>
          <div className={styles.fadeOverlayBottom}></div>
          <div className={styles.column}>
            <div className={`${styles.marqueeVertical} ${styles.scrollDown}`}>
              {col1.map((partner, idx) => (
                <div key={`c1-${idx}`} className={styles.logoItem}>
                  {partner.logo?.url ? (
                    <Image
                      src={partner.logo.url}
                      alt={partner.logo.alt || partner.name || 'Partner'}
                      width={120}
                      height={48}
                      className={styles.logoImage}
                    />
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.column}>
            <div className={`${styles.marqueeVertical} ${styles.scrollUp}`}>
              {col2.map((partner, idx) => (
                <div key={`c2-${idx}`} className={styles.logoItem}>
                  {partner.logo?.url ? (
                    <Image
                      src={partner.logo.url}
                      alt={partner.logo.alt || partner.name || 'Partner'}
                      width={120}
                      height={48}
                      className={styles.logoImage}
                    />
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.column}>
            <div className={`${styles.marqueeVertical} ${styles.scrollDownFast}`}>
              {col3.map((partner, idx) => (
                <div key={`c3-${idx}`} className={styles.logoItem}>
                  {partner.logo?.url ? (
                    <Image
                      src={partner.logo.url}
                      alt={partner.logo.alt || partner.name || 'Partner'}
                      width={120}
                      height={48}
                      className={styles.logoImage}
                    />
                  ) : (
                    <span>{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
