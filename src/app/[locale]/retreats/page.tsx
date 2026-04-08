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

export default async function RetreatsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  let retreats: Event[] = [];
  try {
    const result = await payload.find({
      collection: 'events',
      depth: 1,
      limit: 100,
      sort: '-eventDate',
      where: {
        isActive: { equals: true },
        type: { equals: 'retreat' },
      },
    });
    retreats = result.docs as Event[];
  } catch (error) {
    console.error('[RetreatsPage] Failed to fetch data:', error);
  }

  const upcoming = retreats
    .filter((e) => e.eventDate && new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const past = retreats
    .filter((e) => e.eventDate && new Date(e.eventDate) < now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

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
            <p className={styles.eyebrow}>{locale === 'ar' ? 'خلوات تطويرية' : 'Retreats'}</p>
            <h1 className={styles.title}>
              {locale === 'ar'
                ? 'تجارب تعلّم غامرة بعيداً عن الروتين'
                : 'Immersive Learning Retreats Away From The Routine'}
            </h1>
            <p className={styles.subtitle}>
              {locale === 'ar'
                ? 'خلوات مكثفة تجمع التعلّم العملي، التواصل مع الخبراء، والاسترخاء في بيئة ملهمة.'
                : 'Intensive retreats combining hands-on learning, expert networking, and relaxation in inspiring environments.'}
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span>{retreats.length}</span>
                <small>{locale === 'ar' ? 'خلوة' : 'Retreats'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{upcoming.length}</span>
                <small>{locale === 'ar' ? 'قادمة' : 'Upcoming'}</small>
              </div>
            </div>
            <div className={styles.heroActions}>
              <Link href={`/${locale}/contact`}>
                <Button variant="primary">{locale === 'ar' ? 'تواصل معنا' : 'Get In Touch'}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{locale === 'ar' ? 'الخلوات القادمة' : 'Upcoming Retreats'}</h2>
            </div>
            <div className={styles.grid}>
              {upcoming.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا توجد خلوات قادمة حالياً.' : 'No upcoming retreats at the moment.'}
                </p>
              )}
              {upcoming.map((event, index) => {
                const imageUrl = getMediaUrl(event.coverImage) || getMediaUrl(event.thumbnail) || fallbackImages[index % fallbackImages.length];
                const title = locale === 'ar'
                  ? event.titleAr || event.titleEn || 'خلوة'
                  : event.titleEn || event.titleAr || 'Retreat';

                const dateRange = event.eventEndDate
                  ? `${new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })} – ${new Date(event.eventEndDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}`
                  : new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US');

                return (
                  <article key={event.id} className={styles.eventCard}>
                    <div className={styles.eventImageWrap}>
                      <Image src={imageUrl} alt={title} fill className={styles.eventImage} sizes="(max-width: 768px) 100vw, 33vw" />
                      <Badge className={styles.typeBadge}>{locale === 'ar' ? 'خلوة' : 'Retreat'}</Badge>
                    </div>
                    <div className={styles.eventBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        <span>📅 {dateRange}</span>
                        <span>📍 {event.venue || (locale === 'ar' ? 'يُحدد لاحقاً' : 'TBA')}</span>
                      </div>
                    </div>
                    <div className={styles.eventFooter}>
                      <span>{(event.price || 0).toLocaleString()} {event.currency || 'EGP'}</span>
                      <Link href={`/${locale}/events/${event.slug || event.id}`}>
                        <Button variant="primary" size="sm">{locale === 'ar' ? 'تفاصيل وحجز' : 'Details & Book'}</Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {past.length > 0 && (
          <section className={styles.sectionAlt}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2>{locale === 'ar' ? 'خلوات سابقة' : 'Past Retreats'}</h2>
              </div>
              <div className={styles.pastList}>
                {past.map((event) => {
                  const title = locale === 'ar'
                    ? event.titleAr || event.titleEn || 'خلوة'
                    : event.titleEn || event.titleAr || 'Retreat';
                  return (
                    <div key={event.id} className={styles.pastItem}>
                      <div>
                        <h3>{title}</h3>
                        <p>
                          {new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                          {event.venue ? ` • ${event.venue}` : ''}
                        </p>
                      </div>
                      <div className={styles.pastMeta}>
                        <Badge variant="outline">
                          {event.attendeesCount || 0} {locale === 'ar' ? 'مشارك' : 'attendees'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
