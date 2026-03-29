import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Media, Program, Round } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function getMediaUrl(media: Program['coverImage'] | Program['thumbnail']): string | null {
  if (!media || typeof media === 'number') return null;
  const typedMedia = media as Media;
  return typedMedia.url || null;
}

function buildTypeLabel(type: Program['type'], locale: string): string {
  if (locale === 'ar') {
    if (type === 'course') return 'دورة';
    if (type === 'workshop') return 'ورشة';
    return 'ندوة';
  }

  if (type === 'course') return 'Course';
  if (type === 'workshop') return 'Workshop';
  return 'Webinar';
}

export default async function EventsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  let rounds: Round[] = [];
  try {
    const roundsResult = await payload.find({
      collection: 'rounds',
      depth: 2,
      limit: 300,
      sort: '-startDate',
      where: { isActive: { equals: true } },
    });
    rounds = roundsResult.docs as Round[];
  } catch (error) {
    console.error('[EventsPage] Failed to load rounds:', error);
  }

  const eventRounds = rounds.filter((round) => {
    const program = typeof round.program === 'object' ? round.program : null;
    return !!program && program.type !== 'webinar';
  });

  const upcomingEvents = eventRounds
    .filter((round) => round.startDate && new Date(round.startDate) >= now)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  const pastEvents = eventRounds
    .filter((round) => round.startDate && new Date(round.startDate) < now)
    .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());

  const totalAttendees = eventRounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);
  const uniquePrograms = new Set(
    eventRounds.map((round) => (typeof round.program === 'object' ? round.program.id : null)).filter(Boolean),
  ).size;

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
                <span>{uniquePrograms}</span>
                <small>{locale === 'ar' ? 'برامج مستضافة' : 'Hosted Programs'}</small>
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

              {upcomingEvents.slice(0, 8).map((round, index) => {
                const program = round.program as Program;
                const imageUrl = getMediaUrl(program.coverImage) || getMediaUrl(program.thumbnail) || fallbackImages[index % fallbackImages.length];
                const instructor =
                  typeof program.instructor === 'object' && program.instructor
                    ? `${program.instructor.firstName} ${program.instructor.lastName}`.trim()
                    : locale === 'ar'
                      ? 'فريق نكست'
                      : 'Next Team';

                const title =
                  locale === 'ar'
                    ? program.titleAr || program.titleEn || 'Program'
                    : program.titleEn || program.titleAr || 'Program';

                return (
                  <article key={round.id} className={styles.eventCard}>
                    <div className={styles.eventImageWrap}>
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className={styles.eventImage}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <span className={styles.typeBadge}>{buildTypeLabel(program.type, locale)}</span>
                    </div>

                    <div className={styles.eventBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        <span>{round.startDate ? new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ''}</span>
                        <span>{round.locationType || (locale === 'ar' ? 'أونلاين' : 'Online')}</span>
                        <span>{instructor}</span>
                      </div>
                    </div>

                    <div className={styles.eventFooter}>
                      <span>{(round.price || 0).toLocaleString()} EGP</span>
                      <Link href={`/${locale}/programs/${program.slug || program.id}`}>
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

              {pastEvents.slice(0, 10).map((round) => {
                const program = round.program as Program;
                const title =
                  locale === 'ar'
                    ? program.titleAr || program.titleEn || 'Program'
                    : program.titleEn || program.titleAr || 'Program';
                const learners = round.currentEnrollments || 0;

                return (
                  <article key={`past-${round.id}`} className={styles.pastItem}>
                    <div>
                      <h3>{title}</h3>
                      <p>
                        {round.startDate ? new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ''} •{' '}
                        {round.locationType || (locale === 'ar' ? 'أونلاين' : 'Online')}
                      </p>
                    </div>
                    <div className={styles.pastMeta}>
                      <Badge variant="outline">{learners.toLocaleString()} {locale === 'ar' ? 'حضور' : 'attendees'}</Badge>
                      <Link href={`/${locale}/programs/${program.slug || program.id}`}>
                        <Button variant="ghost" size="sm">
                          {locale === 'ar' ? 'عرض البرنامج' : 'View Program'}
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{locale === 'ar' ? 'معرض الصور والفيديو' : 'Photo And Video Gallery'}</h2>
            </div>

            <div className={styles.gallery}>
              {fallbackImages.map((image, index) => (
                <div key={image} className={styles.galleryItem}>
                  <Image
                    src={image}
                    alt={`Event gallery ${index + 1}`}
                    fill
                    className={styles.galleryImage}
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
              ))}
              <div className={styles.videoCard}>
                <span className={styles.playIcon}>▶</span>
                <p>{locale === 'ar' ? 'مشاهد من فعاليات نكست' : 'Highlights From Next Events'}</p>
              </div>
              <div className={styles.videoCard}>
                <span className={styles.playIcon}>▶</span>
                <p>{locale === 'ar' ? 'لقاءات الخبراء' : 'Expert Meetups Recap'}</p>
              </div>
              <div className={styles.videoCard}>
                <span className={styles.playIcon}>▶</span>
                <p>{locale === 'ar' ? 'ورش العمل التطبيقية' : 'Hands-on Workshops'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
