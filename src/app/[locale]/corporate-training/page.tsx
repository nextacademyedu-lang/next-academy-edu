import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Event, Media } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function getMediaUrl(media: Event['coverImage'] | Event['thumbnail']): string | null {
  if (!media || typeof media === 'number') return null;
  return (media as Media).url || null;
}

export default async function CorporateTrainingPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  let events: Event[] = [];
  try {
    const result = await payload.find({
      collection: 'events',
      depth: 1,
      limit: 100,
      sort: '-eventDate',
      where: {
        isActive: { equals: true },
        type: { equals: 'corporate_training' },
      },
    });
    events = result.docs as Event[];
  } catch (error) {
    console.error('[CorporateTrainingPage] Failed to fetch data:', error);
  }

  const upcoming = events
    .filter((e) => e.eventDate && new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const totalAttendees = events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);

  const fallbackImages = [
    '/images/about/hero-bg.png',
    '/images/about/story-workshop.png',
    '/images/about/story.png',
  ];

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{locale === 'ar' ? 'تدريب الشركات' : 'Corporate Training'}</p>
            <h1 className={styles.title}>
              {locale === 'ar'
                ? 'ارتقِ بفريقك من خلال برامج تدريبية مصمّمة خصيصاً'
                : 'Upskill Your Team With Tailored Training Programs'}
            </h1>
            <p className={styles.subtitle}>
              {locale === 'ar'
                ? 'برامج تدريب مؤسسي مصممة حسب احتياجات شركتك، يقدمها خبراء عمليون من السوق.'
                : "Custom corporate training programs delivered by industry practitioners, designed around your team's needs."}
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span>{events.length}</span>
                <small>{locale === 'ar' ? 'برنامج' : 'Programs'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{upcoming.length}</span>
                <small>{locale === 'ar' ? 'دورة قادمة' : 'Upcoming'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{totalAttendees.toLocaleString()}</span>
                <small>{locale === 'ar' ? 'متدرب' : 'Trained'}</small>
              </div>
            </div>
            <div className={styles.heroActions}>
              <Link href={`/${locale}/contact`}>
                <Button variant="primary">{locale === 'ar' ? 'اطلب عرض سعر' : 'Request A Quote'}</Button>
              </Link>
              <Link href={`/${locale}/for-business`}>
                <Button variant="secondary">{locale === 'ar' ? 'خدمات الشركات' : 'Enterprise Solutions'}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{locale === 'ar' ? 'البرامج المتاحة' : 'Available Programs'}</h2>
            </div>
            <div className={styles.grid}>
              {events.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar'
                    ? 'لا توجد برامج تدريب مؤسسي متاحة حالياً. تواصل معنا لتصميم برنامج مخصص.'
                    : 'No corporate training programs available yet. Contact us for a custom program.'}
                </p>
              )}
              {events.map((event, index) => {
                const imageUrl = getMediaUrl(event.coverImage) || getMediaUrl(event.thumbnail) || fallbackImages[index % fallbackImages.length];
                const title = locale === 'ar'
                  ? event.titleAr || event.titleEn || 'برنامج'
                  : event.titleEn || event.titleAr || 'Program';
                const description = locale === 'ar'
                  ? event.shortDescriptionAr || ''
                  : event.shortDescriptionEn || event.shortDescriptionAr || '';

                return (
                  <article key={event.id} className={styles.eventCard}>
                    <div className={styles.eventImageWrap}>
                      <Image src={imageUrl} alt={title} fill className={styles.eventImage} sizes="(max-width: 768px) 100vw, 33vw" />
                      <Badge className={styles.typeBadge}>{locale === 'ar' ? 'تدريب مؤسسي' : 'Corporate'}</Badge>
                    </div>
                    <div className={styles.eventBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        {description && <span>{description.slice(0, 100)}{description.length > 100 ? '...' : ''}</span>}
                        {event.eventDate && (
                          <span>📅 {new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.eventFooter}>
                      <span>
                        {event.price
                          ? `${(event.price).toLocaleString()} ${event.currency || 'EGP'}`
                          : locale === 'ar' ? 'تواصل للسعر' : 'Contact for pricing'}
                      </span>
                      <Link href={`/${locale}/events/${event.slug || event.id}`}>
                        <Button variant="primary" size="sm">{locale === 'ar' ? 'تفاصيل' : 'Details'}</Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
