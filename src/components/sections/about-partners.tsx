"use client";

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './about-partners.module.css';

type PartnerLogo = {
  name?: string;
  logo?: {
    url?: string;
    alt?: string;
  } | null;
};

const FALLBACK_NAMES = [
  'Microsoft', 'Google', 'AWS', 'Cisco', 'IBM',
  'Oracle', 'SAP', 'Salesforce', 'Adobe', 'Meta',
];

export function AboutPartners() {
  const t = useTranslations('About');
  const [partners, setPartners] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    const url = new URL('/api/partners', window.location.origin);
    url.searchParams.set('where[isActive][equals]', 'true');
    url.searchParams.set('sort', 'orderIndex');
    url.searchParams.set('depth', '1');

    fetch(url.toString())
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.docs)) {
          setPartners(data.docs);
        }
      })
      .catch(() => {
        setPartners([]);
      });
  }, []);

  const items = useMemo<PartnerLogo[]>(
    () => (partners.length ? partners : FALLBACK_NAMES.map((name) => ({ name, logo: null }))),
    [partners]
  );

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <span className={styles.eyebrow}>{t('partnersEyebrow')}</span>
          <h2 className={styles.heading}>{t('partnersTitle')}</h2>
        </motion.div>
      </div>

      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          {[...items, ...items].map((partner, i) => {
            const logoUrl = partner.logo?.url;
            const label = partner.name || t('partnersTitle');
            return (
              <div key={`${label}-${i}`} className={styles.partnerChip}>
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={partner.logo?.alt || label}
                    width={120}
                    height={48}
                    className={styles.partnerLogo}
                  />
                ) : (
                  <span className={styles.partnerName}>{label}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
