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
import { buildYouTubeThumbnailUrl } from '@/lib/youtube';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function getMediaUrl(media: Program['coverImage'] | Program['thumbnail']): string | null {
  if (!media || typeof media === 'number') return null;
  const typedMedia = media as Media;
  return typedMedia.url || null;
}

export default async function WebinarsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  let webinars: Program[] = [];
  let rounds: Round[] = [];

  try {
    const webinarsResult = await payload.find({
      collection: 'programs',
      depth: 2,
      limit: 200,
      sort: '-createdAt',
      where: {
        and: [
          { isActive: { equals: true } },
          { type: { equals: 'webinar' } },
        ],
      },
    });
    webinars = webinarsResult.docs as Program[];

    const webinarIds = webinars.map((program) => program.id);
    if (webinarIds.length > 0) {
      const roundsResult = await payload.find({
        collection: 'rounds',
        depth: 0,
        limit: 400,
        sort: '-startDate',
        where: { program: { in: webinarIds } },
      });
      rounds = roundsResult.docs as Round[];
    }
  } catch (error) {
    console.error('[WebinarsPage] Failed to fetch data:', error);
  }

  const roundsByProgram = new Map<number, Round[]>();
  for (const round of rounds) {
    const programId = typeof round.program === 'number' ? round.program : round.program?.id;
    if (!programId) continue;
    const existing = roundsByProgram.get(programId) || [];
    existing.push(round);
    roundsByProgram.set(programId, existing);
  }

  const upcomingRounds = rounds
    .filter((round) => round.startDate && new Date(round.startDate) >= now)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  const archivedRounds = rounds
    .filter((round) => round.startDate && new Date(round.startDate) < now)
    .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());

  const totalLearners = rounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);
  const totalViews = webinars.reduce((sum, webinar) => sum + (webinar.viewCount || 0), 0);

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
            <p className={styles.eyebrow}>{locale === 'ar' ? 'مكتبة الويبنار' : 'Webinar Library'}</p>
            <h1 className={styles.title}>
              {locale === 'ar'
                ? 'ندوات مباشرة ومحتوى عند الطلب من خبراء السوق'
                : 'Live And On-Demand Webinars By Industry Practitioners'}
            </h1>
            <p className={styles.subtitle}>
              {locale === 'ar'
                ? 'تابع الندوات القادمة أو ارجع إلى الأرشيف لمشاهدة أبرز الجلسات السابقة.'
                : 'Join upcoming live webinars or revisit archived sessions to keep your skills sharp and current.'}
            </p>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span>{webinars.length}</span>
                <small>{locale === 'ar' ? 'ندوة متاحة' : 'Active Webinars'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{upcomingRounds.length}</span>
                <small>{locale === 'ar' ? 'جلسة قادمة' : 'Upcoming Sessions'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{archivedRounds.length}</span>
                <small>{locale === 'ar' ? 'جلسة سابقة' : 'Archived Sessions'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{totalLearners.toLocaleString()}</span>
                <small>{locale === 'ar' ? 'إجمالي المشاركين' : 'Total Participants'}</small>
              </div>
            </div>

            <div className={styles.heroActions}>
              <Link href={`/${locale}/courses?type=webinar`}>
                <Button variant="primary">{locale === 'ar' ? 'تصفح كل الندوات' : 'Browse All Webinars'}</Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button variant="secondary">{locale === 'ar' ? 'حجز ندوة خاصة' : 'Request Private Webinar'}</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>{locale === 'ar' ? 'الجلسات القادمة' : 'Upcoming Live Sessions'}</h2>
            </div>

            <div className={styles.grid}>
              {upcomingRounds.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا توجد جلسات مباشرة قادمة حالياً.' : 'No upcoming live sessions at the moment.'}
                </p>
              )}

              {upcomingRounds.map((round, index) => {
                const programId = typeof round.program === 'number' ? round.program : round.program?.id;
                const webinar = webinars.find((item) => item.id === programId);
                if (!webinar) return null;

                const title =
                  locale === 'ar'
                    ? webinar.titleAr || webinar.titleEn || 'Webinar'
                    : webinar.titleEn || webinar.titleAr || 'Webinar';
                const youtubeThumbnail = round.meetingUrl ? buildYouTubeThumbnailUrl(round.meetingUrl, 'hqdefault') : null;
                const image =
                  getMediaUrl(webinar.coverImage) ||
                  getMediaUrl(webinar.thumbnail) ||
                  youtubeThumbnail ||
                  fallbackImages[index % fallbackImages.length];
                const instructor =
                  typeof webinar.instructor === 'object' && webinar.instructor
                    ? `${webinar.instructor.firstName} ${webinar.instructor.lastName}`.trim()
                    : locale === 'ar'
                      ? 'فريق نكست'
                      : 'Next Team';

                return (
                  <article key={round.id} className={styles.sessionCard}>
                    <div className={styles.sessionImageWrap}>
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className={styles.sessionImage}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <span className={styles.liveBadge}>{locale === 'ar' ? 'مباشر' : 'LIVE'}</span>
                    </div>

                    <div className={styles.sessionBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        <span>{round.startDate ? new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ''}</span>
                        <span>{instructor}</span>
                        <span>{(round.currentEnrollments || 0).toLocaleString()} {locale === 'ar' ? 'مشترك' : 'attendees'}</span>
                      </div>
                    </div>

                    <div className={styles.sessionFooter}>
                      <span>{(round.price || 0).toLocaleString()} EGP</span>
                      <Link href={`/${locale}/programs/${webinar.slug || webinar.id}`}>
                        <Button variant="primary" size="sm">
                          {locale === 'ar' ? 'احجز' : 'Reserve'}
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
              <h2>{locale === 'ar' ? 'أرشيف الجلسات السابقة' : 'Archived Webinar Sessions'}</h2>
            </div>

            <div className={styles.archiveList}>
              {archivedRounds.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا يوجد أرشيف متاح حالياً.' : 'No archive available yet.'}
                </p>
              )}

              {archivedRounds.map((round, index) => {
                const programId = typeof round.program === 'number' ? round.program : round.program?.id;
                const webinar = webinars.find((item) => item.id === programId);
                if (!webinar) return null;

                const title =
                  locale === 'ar'
                    ? webinar.titleAr || webinar.titleEn || 'Webinar'
                    : webinar.titleEn || webinar.titleAr || 'Webinar';
                const programHref = `/${locale}/programs/${webinar.slug || webinar.id}`;
                const actionHref = round.meetingUrl ? `${programHref}#recording-${round.id}` : programHref;
                const actionLabel = round.meetingUrl
                  ? locale === 'ar'
                    ? 'شاهد التسجيل'
                    : 'Watch Recording'
                  : locale === 'ar'
                    ? 'عرض الندوة'
                    : 'View Webinar';
                const youtubeThumbnail = round.meetingUrl ? buildYouTubeThumbnailUrl(round.meetingUrl, 'hqdefault') : null;
                const image =
                  getMediaUrl(webinar.coverImage) ||
                  getMediaUrl(webinar.thumbnail) ||
                  youtubeThumbnail ||
                  fallbackImages[index % fallbackImages.length];

                return (
                  <article key={`archive-${round.id}`} className={styles.archiveItem}>
                    <div className={styles.archiveMedia}>
                      <Image
                        src={image}
                        alt={title}
                        fill
                        className={styles.archiveImage}
                        sizes="(max-width: 768px) 100vw, 220px"
                      />
                    </div>
                    <div>
                      <h3>{title}</h3>
                      <p>{round.startDate ? new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ''}</p>
                    </div>
                    <div className={styles.archiveActions}>
                      <Badge variant="outline">{(round.currentEnrollments || 0).toLocaleString()} {locale === 'ar' ? 'حضور' : 'attendees'}</Badge>
                      <Link href={actionHref} className={styles.archiveActionLink}>
                        {actionLabel}
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
              <h2>{locale === 'ar' ? 'هايلايتس الفيديو' : 'Video Highlights'}</h2>
              <p>{locale === 'ar' ? `${totalViews.toLocaleString()} مشاهدة إجمالية` : `${totalViews.toLocaleString()} total views`}</p>
            </div>

            <div className={styles.highlights}>
              {fallbackImages.map((image, index) => (
                <article key={image} className={styles.highlightCard}>
                  <div className={styles.highlightMedia}>
                    <Image
                      src={image}
                      alt={`Webinar highlight ${index + 1}`}
                      fill
                      className={styles.highlightImage}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <span className={styles.play}>▶</span>
                  </div>
                  <div className={styles.highlightBody}>
                    <h3>{locale === 'ar' ? `لقطة مميزة ${index + 1}` : `Highlight Session ${index + 1}`}</h3>
                    <p>{locale === 'ar' ? 'ملخص سريع لأهم النقاط العملية.' : 'Quick recap of practical key takeaways.'}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
