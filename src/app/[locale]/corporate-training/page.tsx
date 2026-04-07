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

export default async function CorporateTrainingPage() {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();

  let programs: Program[] = [];
  let rounds: Round[] = [];

  try {
    const result = await payload.find({
      collection: 'programs',
      depth: 2,
      limit: 100,
      sort: '-createdAt',
      where: {
        and: [
          { isActive: { equals: true } },
          { type: { equals: 'corporate_training' } },
        ],
      },
    });
    programs = result.docs as Program[];

    const programIds = programs.map((p) => p.id);
    if (programIds.length > 0) {
      const roundsResult = await payload.find({
        collection: 'rounds',
        depth: 0,
        limit: 300,
        sort: '-startDate',
        where: {
          and: [
            { program: { in: programIds } },
            { isActive: { equals: true } },
          ],
        },
      });
      rounds = roundsResult.docs as Round[];
    }
  } catch (error) {
    console.error('[CorporateTrainingPage] Failed to fetch data:', error);
  }

  const upcomingRounds = rounds
    .filter((r) => r.startDate && new Date(r.startDate) >= now)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  const totalLearners = rounds.reduce((sum, r) => sum + (r.currentEnrollments || 0), 0);

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
                : 'Custom corporate training programs delivered by industry practitioners, designed around your team\'s needs.'}
            </p>

            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span>{programs.length}</span>
                <small>{locale === 'ar' ? 'برنامج' : 'Programs'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{upcomingRounds.length}</span>
                <small>{locale === 'ar' ? 'دورة قادمة' : 'Upcoming Rounds'}</small>
              </div>
              <div className={styles.heroStat}>
                <span>{totalLearners.toLocaleString()}</span>
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
              {programs.length === 0 && (
                <p className={styles.emptyText}>
                  {locale === 'ar'
                    ? 'لا توجد برامج تدريب مؤسسي متاحة حالياً. تواصل معنا لتصميم برنامج مخصص.'
                    : 'No corporate training programs available yet. Contact us for a custom program.'}
                </p>
              )}

              {programs.map((program, index) => {
                const imageUrl = getMediaUrl(program.coverImage) || getMediaUrl(program.thumbnail) || fallbackImages[index % fallbackImages.length];
                const instructor = getInstructorNames(
                  program.instructor,
                  locale === 'ar' ? 'فريق نكست' : 'Next Team',
                );
                const title =
                  locale === 'ar'
                    ? program.titleAr || program.titleEn || 'Program'
                    : program.titleEn || program.titleAr || 'Program';
                const description =
                  locale === 'ar'
                    ? program.shortDescriptionAr || ''
                    : program.shortDescriptionEn || program.shortDescriptionAr || '';

                const programRounds = upcomingRounds.filter((r) => {
                  const rid = typeof r.program === 'number' ? r.program : r.program?.id;
                  return rid === program.id;
                });
                const nextRound = programRounds[0];

                return (
                  <article key={program.id} className={styles.eventCard}>
                    <div className={styles.eventImageWrap}>
                      <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className={styles.eventImage}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <Badge className={styles.typeBadge}>
                        {locale === 'ar' ? 'تدريب مؤسسي' : 'Corporate'}
                      </Badge>
                    </div>

                    <div className={styles.eventBody}>
                      <h3>{title}</h3>
                      <div className={styles.meta}>
                        {description && <span>{description.slice(0, 100)}{description.length > 100 ? '...' : ''}</span>}
                        <span>👤 {instructor}</span>
                        {nextRound?.startDate && (
                          <span>
                            📅 {new Date(nextRound.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className={styles.eventFooter}>
                      <span>
                        {nextRound
                          ? `${(nextRound.price || 0).toLocaleString()} ${nextRound.currency || 'EGP'}`
                          : locale === 'ar' ? 'تواصل للسعر' : 'Contact for pricing'}
                      </span>
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
      </main>

      <Footer />
    </div>
  );
}
