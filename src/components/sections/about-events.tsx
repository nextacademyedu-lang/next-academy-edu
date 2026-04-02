"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import styles from './about-events.module.css';

const EVENTS = [
  {
    key: 'eventsMajlis',
    image: '/images/about/story-workshop.png',
    href: (locale: string) => `/${locale}/events`,
  },
  {
    key: 'eventsBls',
    image: '/images/about/story.png',
    href: () => 'https://www.youtube.com/playlist?list=PLVEiQf5ekC9B3yEbTtmCzZX--iMKUokQV',
    external: true,
  },
];

export function AboutEvents() {
  const t = useTranslations('About');
  const locale = useLocale();

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.eyebrow}>{t('eventsEyebrow')}</span>
          <h2 className={styles.heading}>{t('eventsTitle')}</h2>
          <p className={styles.subheading}>{t('eventsSubtitle')}</p>
        </motion.div>

        <div className={styles.grid}>
          {EVENTS.map((event, i) => {
            const href = event.href(locale);
            const isExternal = event.external;

            const content = (
              <>
                <div className={styles.media}>
                  <Image
                    src={event.image}
                    alt={t(`${event.key}Title`)}
                    width={560}
                    height={360}
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className={styles.overlay} />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{t(`${event.key}Title`)}</h3>
                  <p className={styles.cardDesc}>{t(`${event.key}Desc`)}</p>
                  <span className={styles.cardCta}>{t(`${event.key}Cta`)}</span>
                </div>
              </>
            );

            return (
              <motion.div
                key={event.key}
                className={styles.card}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                {isExternal ? (
                  <a
                    href={href}
                    className={styles.cardLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  <Link href={href} className={styles.cardLink}>
                    {content}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
