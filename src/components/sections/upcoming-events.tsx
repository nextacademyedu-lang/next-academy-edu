'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import styles from './upcoming-events.module.css';

interface EventData {
  id: string | number;
  titleAr: string;
  titleEn: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isOnline?: boolean;
  price?: number;
  currency?: string;
  isFree?: boolean;
  registrationUrl?: string;
  image?: { url: string } | string;
}

interface UpcomingEventsProps {
  locale: string;
}

export function UpcomingEvents({ locale }: UpcomingEventsProps) {
  const t = useTranslations('UpcomingEvents');
  const isAr = locale === 'ar';
  const trackRef = useRef<HTMLDivElement>(null);

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/upcoming-events');
        if (!res.ok) return;
        const data = await res.json();
        setEvents(data.events || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const scroll = useCallback((direction: 'prev' | 'next') => {
    if (!trackRef.current) return;
    const scrollAmount = 370; // card width + gap
    trackRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (evt: EventData) => {
    if (evt.isFree) return t('free');
    if (!evt.price) return null;
    const currency = evt.currency || 'SAR';
    return new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-SA', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(evt.price);
  };

  // Don't render if no events and not loading
  if (!loading && events.length === 0) return null;

  return (
    <section className={styles.section} id="upcoming-events">
      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.subtitle}>{t('subtitle')}</p>
          </div>

          {events.length > 3 && (
            <div className={styles.navBtns}>
              <button
                className={styles.navBtn}
                onClick={() => scroll('prev')}
                aria-label={t('previous')}
              >
                {isAr ? '→' : '←'}
              </button>
              <button
                className={styles.navBtn}
                onClick={() => scroll('next')}
                aria-label={t('next')}
              >
                {isAr ? '←' : '→'}
              </button>
            </div>
          )}
        </motion.div>

        {loading ? (
          <div className={styles.loading}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.track} ref={trackRef}>
            {events.map((evt, idx) => {
              const title = isAr ? evt.titleAr : evt.titleEn;
              const imageUrl =
                evt.image && typeof evt.image === 'object' ? evt.image.url : evt.image;
              const price = formatPrice(evt);

              return (
                <motion.div
                  key={evt.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  {evt.registrationUrl ? (
                    <a
                      href={evt.registrationUrl}
                      className={styles.cardLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <EventCardContent
                        imageUrl={imageUrl}
                        title={title}
                        date={formatDate(evt.startDate)}
                        location={evt.location}
                        isOnline={evt.isOnline}
                        price={price}
                        isFree={evt.isFree}
                        t={t}
                      />
                    </a>
                  ) : (
                    <EventCardContent
                      imageUrl={imageUrl}
                      title={title}
                      date={formatDate(evt.startDate)}
                      location={evt.location}
                      isOnline={evt.isOnline}
                      price={price}
                      isFree={evt.isFree}
                      t={t}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

interface EventCardContentProps {
  imageUrl?: string;
  title: string;
  date: string;
  location?: string;
  isOnline?: boolean;
  price: string | null;
  isFree?: boolean;
  t: ReturnType<typeof useTranslations>;
}

function EventCardContent({
  imageUrl,
  title,
  date,
  location,
  isOnline,
  price,
  isFree,
  t,
}: EventCardContentProps) {
  return (
    <>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className={styles.cardImage} loading="lazy" />
      ) : (
        <div className={styles.cardImagePlaceholder}>📅</div>
      )}
      <div className={styles.cardBody}>
        <span className={styles.cardDate}>📅 {date}</span>
        <h3 className={styles.cardTitle}>{title}</h3>
        {(location || isOnline) && (
          <span className={styles.cardLocation}>
            📍 {isOnline ? t('online') : location}
          </span>
        )}
        {price && (
          <span className={isFree ? styles.cardPriceFree : styles.cardPrice}>
            {price}
          </span>
        )}
      </div>
    </>
  );
}
