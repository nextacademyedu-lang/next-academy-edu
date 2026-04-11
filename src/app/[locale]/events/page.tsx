import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Event, Media } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/events',
    titleAr: 'الفعاليات',
    titleEn: 'Events',
    descriptionAr: 'تصفح الفعاليات القادمة وأرشيف الفعاليات السابقة في Next Academy.',
    descriptionEn: 'Browse upcoming events and past event archives at Next Academy.',
  });
}

function getMediaUrl(media: Event['coverImage'] | Event['thumbnail']): string | null {
  if (!media || typeof media === 'number') return null;
  const typedMedia = media as Media;
  return typedMedia.url || null;
}

function buildTypeLabel(type: Event['type'], locale: string): string {
  if (locale === 'ar') {
    if (type === 'event') return 'فعالية';
    if (type === 'retreat') return 'خلوة';
    if (type === 'corporate_training') return 'تدريب مؤسسي';
    return 'فعالية';
  }
  if (type === 'event') return 'Event';
  if (type === 'retreat') return 'Retreat';
  if (type === 'corporate_training') return 'Corporate Training';
  return 'Event';
}

export default async function EventsPage() {
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
        type: { equals: 'event' },
      },
    });
    events = result.docs as Event[];
  } catch (error) {
    console.error('[EventsPage] Failed to load events:', error);
  }

  const upcomingEvents = events
    .filter((e) => e.eventDate && new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  const pastEvents = events
    .filter((e) => e.eventDate && new Date(e.eventDate) < now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const totalAttendees = events.reduce((sum, e) => sum + (e.attendeesCount || 0), 0);

  const fallbackImages = [
    '/images/about/story-workshop.png',
    '/images/about/hero-bg.png',
    '/images/about/story.png',
  ];

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{locale === 'ar' ? 'فعاليات نكست' : 'Next Academy Events'}</p>
            <h1 className={styles.title}>
              {locale === 'ar'
                ? 'فعاليات وتجارب تعليمية بتجمع الخبرة والتواصل'
                : 'Events That Blend Learning, Networking, And Real Execution'}
            </h1>
            <p className={styles.subtitle}>
              {locale === 'ar'
                ? 'من ورش ميدانية إلى لقاءات خبراء، نستضيف فعاليات حية تساعدك تبني علاقات أقوى وتطبق المهارات مباشرة.'
                : 'From practical workshops to expert meetups, our events are built for direct application and stronger professional connections.'}
            </p>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span>{upcomingEvents.length}</span>
                <small>{locale === 'ar' ? 'فعالية قادمة' : 'Upcoming Events'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{pastEvents.length}</span>
                <small>{locale === 'ar' ? 'فعالية سابقة' : 'Past Events'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{totalAttendees.toLocaleString()}</span>
                <small>{locale === 'ar' ? 'إجمالي حضور' : 'Total Attendees'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{events.length}</span>
                <small>{locale === 'ar' ? 'فعاليات مستضافة' : 'Hosted Events'}</small>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link href={`/${locale}/courses`}>
                <Button variant="primary" size="md">
                  {locale === 'ar' ? 'استكشف الدورات' : 'Explore Courses'}
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button variant="secondary" size="md">
                  {locale === 'ar' ? 'احجز لشركتك' : 'Book For Your Team'}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{locale === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}</h2>
            </div>

            <div className={styles.grid}>
              {upcomingEvents.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا توجد فعاليات قادمة حالياً.' : 'No upcoming events for now.'}
                </p>
              )}

              {upcomingEvents.slice(0, 8).map((event, index) => {
                const imageUrl = getMediaUrl(event.coverImage) || getMediaUrl(event.thumbnail) || fallbackImages[index % fallbackImages.length];
                const title =
                  locale === 'ar'
                    ? event.titleAr || event.titleEn || 'فعالية'
                    : event.titleEn || event.titleAr || 'Event';

                const locationLabel = event.locationType === 'online'
                  ? (locale === 'ar' ? 'أونلاين' : 'Online')
                  : event.venue || (locale === 'ar' ? 'حضوري' : 'In Person');

                return (
                  <article key={event.id} className={styles.eventCard}>
                    <div className={styles.eventImageWrap}>
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className={styles.eventImage}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <span className={styles.typeBadge}>{buildTypeLabel(event.type, locale)}</span>
                    </div>

                    <div className={styles.eventBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        <span>{new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</span>
                        <span>{locationLabel}</span>
                        <span>{event.price === 0 ? (locale === 'ar' ? 'مجاني' : 'Free') : `${(event.price || 0).toLocaleString()} ${event.currency || 'EGP'}`}</span>
                      </div>
                    </div>

                    <div className={styles.eventFooter}>
                      <span>{event.price === 0 ? (locale === 'ar' ? 'مجاني' : 'Free') : `${(event.price || 0).toLocaleString()} ${event.currency || 'EGP'}`}</span>
                      <Link href={`/${locale}/events/${event.slug || event.id}`}>
                        <Button variant="primary" size="sm">
                          {locale === 'ar' ? 'تفاصيل' : 'Details'}
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{locale === 'ar' ? 'أرشيف الفعاليات السابقة' : 'Past Events Archive'}</h2>
            </div>

            <div className={styles.pastList}>
              {pastEvents.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا توجد فعاليات سابقة بعد.' : 'No archived events yet.'}
                </p>
              )}

              {pastEvents.slice(0, 10).map((event) => {
                const title =
                  locale === 'ar'
                    ? event.titleAr || event.titleEn || 'فعالية'
                    : event.titleEn || event.titleAr || 'Event';
                const attendees = event.attendeesCount || 0;

                return (
                  <article key={`past-${event.id}`} className={styles.pastItem}>
                    <div>
                      <h3>{title}</h3>
                      <p>
                        {new Date(event.eventDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')} •{' '}
                        {event.venue || (locale === 'ar' ? 'أونلاين' : 'Online')}
                      </p>
                    </div>
                    <div className={styles.pastMeta}>
                      <Badge variant="outline">{attendees.toLocaleString()} {locale === 'ar' ? 'حضور' : 'attendees'}</Badge>
                      <Link href={`/${locale}/events/${event.slug || event.id}`}>
                        <Button variant="ghost" size="sm">
                          {locale === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
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
