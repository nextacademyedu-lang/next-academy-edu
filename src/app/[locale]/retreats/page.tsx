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
import { getInstructorNames } from '@/lib/instructor-helpers';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

function getMediaUrl(media: Program['coverImage'] | Program['thumbnail']): string | null {
  if (!media || typeof media === 'number') return null;
  const typedMedia = media as Media;
  return typedMedia.url || null;
}

export default async function RetreatsPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  let retreats: Program[] = [];
  let rounds: Round[] = [];

  try {
    const retreatsResult = await payload.find({
      collection: 'programs',
      depth: 2,
      limit: 100,
      sort: '-createdAt',
      where: {
        and: [
          { isActive: { equals: true } },
          { type: { equals: 'retreat' } },
        ],
      },
    });
    retreats = retreatsResult.docs as Program[];

    const retreatIds = retreats.map((r) => r.id);
    if (retreatIds.length > 0) {
      const roundsResult = await payload.find({
        collection: 'rounds',
        depth: 1,
        limit: 300,
        sort: '-startDate',
        where: {
          and: [
            { program: { in: retreatIds } },
            { isActive: { equals: true } },
          ],
        },
      });
      rounds = roundsResult.docs as Round[];
    }
  } catch (error) {
    console.error('[RetreatsPage] Failed to fetch data:', error);
  }

  const upcomingRounds = rounds
    .filter((r) => r.startDate && new Date(r.startDate) >= now)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  const pastRounds = rounds
    .filter((r) => r.startDate && new Date(r.startDate) < now)
    .sort((a, b) => new Date(b.startDate!).getTime() - new Date(a.startDate!).getTime());

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
                <span>{upcomingRounds.length}</span>
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
              {upcomingRounds.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar' ? 'لا توجد خلوات قادمة حالياً.' : 'No upcoming retreats at the moment.'}
                </p>
              )}

              {upcomingRounds.map((round, index) => {
                const program = retreats.find((r) => {
                  const rid = typeof round.program === 'number' ? round.program : round.program?.id;
                  return r.id === rid;
                });
                if (!program) return null;

                const imageUrl = getMediaUrl(program.coverImage) || getMediaUrl(program.thumbnail) || fallbackImages[index % fallbackImages.length];
                const instructor = getInstructorNames(
                  program.instructor,
                  locale === 'ar' ? 'فريق نكست' : 'Next Team',
                );
                const title =
                  locale === 'ar'
                    ? program.titleAr || program.titleEn || 'Retreat'
                    : program.titleEn || program.titleAr || 'Retreat';

                const dateRange = round.startDate && round.endDate
                  ? `${new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })} – ${new Date(round.endDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}`
                  : round.startDate
                    ? new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')
                    : '';

                const location = round.locationName || (locale === 'ar' ? 'يُحدد لاحقاً' : 'TBA');

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
                      <Badge className={styles.typeBadge}>{locale === 'ar' ? 'خلوة' : 'Retreat'}</Badge>
                    </div>

                    <div className={styles.eventBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        <span>📅 {dateRange}</span>
                        <span>📍 {location}</span>
                        <span>👤 {instructor}</span>
                      </div>
                    </div>

                    <div className={styles.eventFooter}>
                      <span>{(round.price || 0).toLocaleString()} {round.currency || 'EGP'}</span>
                      <Link href={`/${locale}/programs/${program.slug || program.id}`}>
                        <Button variant="primary" size="sm">
                          {locale === 'ar' ? 'تفاصيل وحجز' : 'Details & Book'}
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {pastRounds.length > 0 && (
          <section className={styles.sectionAlt}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <h2>{locale === 'ar' ? 'خلوات سابقة' : 'Past Retreats'}</h2>
              </div>

              <div className={styles.pastList}>
                {pastRounds.map((round) => {
                  const program = retreats.find((r) => {
                    const rid = typeof round.program === 'number' ? round.program : round.program?.id;
                    return r.id === rid;
                  });
                  if (!program) return null;

                  const title =
                    locale === 'ar'
                      ? program.titleAr || program.titleEn || 'Retreat'
                      : program.titleEn || program.titleAr || 'Retreat';

                  return (
                    <div key={round.id} className={styles.pastItem}>
                      <div>
                        <h3>{title}</h3>
                        <p>
                          {round.startDate
                            ? new Date(round.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')
                            : ''}
                          {round.locationName ? ` • ${round.locationName}` : ''}
                        </p>
                      </div>
                      <div className={styles.pastMeta}>
                        <Badge variant="outline">
                          {(round.currentEnrollments || 0)} {locale === 'ar' ? 'مشارك' : 'attendees'}
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
