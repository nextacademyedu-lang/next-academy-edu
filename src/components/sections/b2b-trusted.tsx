import React from 'react';
import { getTranslations } from 'next-intl/server';
import styles from './b2b-trusted.module.css';

const LOGOS_LIST = [
  'Microsoft', 'Google', 'Amazon', 'Meta', 'Netflix',
  'Stripe', 'Spotify', 'Uber', 'Airbnb', 'Salesforce',
  'Adobe', 'Oracle', 'Shopify', 'Paypal', 'Intel',
];

export async function B2BTrustedSection() {
  const t = await getTranslations('B2B');
  const col1 = [...LOGOS_LIST.slice(0, 5), ...LOGOS_LIST.slice(0, 5)];
  const col2 = [...LOGOS_LIST.slice(5, 10), ...LOGOS_LIST.slice(5, 10)];
  const col3 = [...LOGOS_LIST.slice(10, 15), ...LOGOS_LIST.slice(10, 15)];

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
              {col1.map((company, idx) => (
                <div key={`c1-${idx}`} className={styles.logoItem}>{company}</div>
              ))}
            </div>
          </div>
          <div className={styles.column}>
            <div className={`${styles.marqueeVertical} ${styles.scrollUp}`}>
              {col2.map((company, idx) => (
                <div key={`c2-${idx}`} className={styles.logoItem}>{company}</div>
              ))}
            </div>
          </div>
          <div className={styles.column}>
            <div className={`${styles.marqueeVertical} ${styles.scrollDownFast}`}>
              {col3.map((company, idx) => (
                <div key={`c3-${idx}`} className={styles.logoItem}>{company}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
