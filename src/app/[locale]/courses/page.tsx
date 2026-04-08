import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Category, Program, Round, Media } from '@/payload-types';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { buildYouTubeThumbnailUrl } from '@/lib/youtube';
import styles from './page.module.css';
import { getInstructorNames } from '@/lib/instructor-helpers';

export const dynamic = 'force-dynamic';

type PageSearchParams = {
  type?: string | string[];
  category?: string | string[];
  level?: string | string[];
};

const TYPE_FILTERS = ['all', 'course', 'workshop', 'webinar', 'camp'] as const;
const LEVEL_FILTERS = ['all', 'beginner', 'intermediate', 'advanced'] as const;

function pickFirst(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getMediaUrl(media: Program['thumbnail'] | Program['coverImage']): string | null {
  if (!media || typeof media === 'number') return null;
  const typedMedia = media as Media;
  return typedMedia.url || null;
}

function buildPlainTypeLabel(type: Program['type'], locale: string): string {
  if (locale === 'ar') {
    if (type === 'course') return 'دورة';
    if (type === 'workshop') return 'ورشة';
    if (type === 'camp') return 'معسكر';
    if (type === 'webinar') return 'ندوة';
    return type ?? 'برنامج';
  }

  if (type === 'course') return 'Course';
  if (type === 'workshop') return 'Workshop';
  if (type === 'camp') return 'Camp';
  if (type === 'webinar') return 'Webinar';
  return type ?? 'Program';
}

function buildLevelLabel(level: string, locale: string): string {
  if (locale === 'ar') {
    if (level === 'beginner') return 'مبتدئ';
    if (level === 'intermediate') return 'متوسط';
    if (level === 'advanced') return 'متقدم';
    return 'الكل';
  }

  if (level === 'beginner') return 'Beginner';
  if (level === 'intermediate') return 'Intermediate';
  if (level === 'advanced') return 'Advanced';
  return 'All';
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const locale = await getLocale();
  const payload = await getPayload({ config });
  const now = new Date();
  const resolvedSearchParams = await searchParams;

  const rawType = (pickFirst(resolvedSearchParams.type) || 'all').toLowerCase();
  const selectedType = TYPE_FILTERS.includes(rawType as (typeof TYPE_FILTERS)[number])
    ? (rawType as (typeof TYPE_FILTERS)[number])
    : 'all';

  const rawLevel = (pickFirst(resolvedSearchParams.level) || 'all').toLowerCase();
  const selectedLevel = LEVEL_FILTERS.includes(rawLevel as (typeof LEVEL_FILTERS)[number])
    ? (rawLevel as (typeof LEVEL_FILTERS)[number])
    : 'all';

  const rawCategorySlug = (pickFirst(resolvedSearchParams.category) || 'all').toLowerCase();

  const categoriesResult = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 60,
    sort: 'order',
    where: { isActive: { equals: true } },
  });
  const categories = categoriesResult.docs as Category[];

  const selectedCategory = categories.find((cat) => cat.slug === rawCategorySlug);
  const selectedCategorySlug = selectedCategory ? selectedCategory.slug : 'all';

  const whereFilters: any[] = [{ isActive: { equals: true } }];
  if (selectedType !== 'all') whereFilters.push({ type: { equals: selectedType } });
  if (selectedLevel !== 'all') whereFilters.push({ level: { equals: selectedLevel } });
  if (selectedCategory) whereFilters.push({ category: { equals: selectedCategory.id } });

  const programsResult = await payload.find({
    collection: 'programs',
    depth: 2,
    limit: 40,
    sort: '-createdAt',
    where: whereFilters.length > 1 ? { and: whereFilters } : whereFilters[0],
  });
  const programs = programsResult.docs as Program[];

  const programIds = programs.map((program) => program.id);
  let rounds: Round[] = [];

  if (programIds.length > 0) {
    const roundsResult = await payload.find({
      collection: 'rounds',
      depth: 0,
      limit: 500,
      sort: 'startDate',
      where: { program: { in: programIds } },
    });
    rounds = roundsResult.docs as Round[];
  }

  const roundsByProgram = new Map<number, Round[]>();
  for (const round of rounds) {
    const programId = typeof round.program === 'number' ? round.program : round.program?.id;
    if (!programId) continue;
    const current = roundsByProgram.get(programId) || [];
    current.push(round);
    roundsByProgram.set(programId, current);
  }

  const buildFilterHref = (next: Partial<{ type: string; category: string; level: string }>) => {
    const merged = {
      type: selectedType,
      category: selectedCategorySlug,
      level: selectedLevel,
      ...next,
    };

    const params = new URLSearchParams();
    if (merged.type !== 'all') params.set('type', merged.type);
    if (merged.category !== 'all') params.set('category', merged.category);
    if (merged.level !== 'all') params.set('level', merged.level);

    const query = params.toString();
    return `/${locale}/courses${query ? `?${query}` : ''}`;
  };

  const upcomingRoundsCount = rounds.filter((round) => round.startDate && new Date(round.startDate) >= now).length;
  const totalLearners = rounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);

  return (
    <div className={styles.wrapper}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>{locale === 'ar' ? 'كل المحتوى التعليمي' : 'Learning Catalog'}</p>
            <h1 className={styles.title}>
              {locale === 'ar' ? 'الدورات والورش المتاحة الآن' : 'Courses And Workshops Built For Real Outcomes'}
            </h1>
            <p className={styles.subtitle}>
              {locale === 'ar'
                ? 'اختَر المسار المناسب لك من الدورات والورش والندوات، مع محتوى عملي ومدربين من السوق.'
                : 'Browse active courses, workshops, and webinars with practical content and market-ready instructors.'}
            </p>

            <div className={styles.statsRow}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{programs.length}</span>
                <span className={styles.statLabel}>{locale === 'ar' ? 'برنامج متاح' : 'Active Tracks'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{upcomingRoundsCount}</span>
                <span className={styles.statLabel}>{locale === 'ar' ? 'دفعة قادمة' : 'Upcoming Batches'}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{totalLearners.toLocaleString()}</span>
                <span className={styles.statLabel}>{locale === 'ar' ? 'متعلّم مسجّل' : 'Registered Learners'}</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>{locale === 'ar' ? 'النوع' : 'Type'}</p>
                <div className={styles.chips}>
                  {TYPE_FILTERS.map((type) => (
                    <Link
                      key={type}
                      href={buildFilterHref({ type })}
                      className={`${styles.chip} ${selectedType === type ? styles.chipActive : ''}`}
                    >
                      {type === 'all'
                        ? locale === 'ar'
                          ? 'الكل'
                          : 'All'
                        : buildPlainTypeLabel(type as Program['type'], locale)}
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>{locale === 'ar' ? 'المستوى' : 'Level'}</p>
                <div className={styles.chips}>
                  {LEVEL_FILTERS.map((level) => (
                    <Link
                      key={level}
                      href={buildFilterHref({ level })}
                      className={`${styles.chip} ${selectedLevel === level ? styles.chipActive : ''}`}
                    >
                      {buildLevelLabel(level, locale)}
                    </Link>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <p className={styles.filterLabel}>{locale === 'ar' ? 'التصنيف' : 'Category'}</p>
                <div className={styles.chips}>
                  <Link
                    href={buildFilterHref({ category: 'all' })}
                    className={`${styles.chip} ${selectedCategorySlug === 'all' ? styles.chipActive : ''}`}
                  >
                    {locale === 'ar' ? 'الكل' : 'All'}
                  </Link>
                  {categories.slice(0, 8).map((category) => (
                    <Link
                      key={category.id}
                      href={buildFilterHref({ category: category.slug })}
                      className={`${styles.chip} ${selectedCategorySlug === category.slug ? styles.chipActive : ''}`}
                    >
                      {locale === 'ar' ? category.nameAr : category.nameEn || category.nameAr}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              {programs.length === 0 && (
                <div className={styles.emptyState}>
                  <h2>{locale === 'ar' ? 'لا يوجد نتائج حالياً' : 'No matching results'}</h2>
                  <p>
                    {locale === 'ar'
                      ? 'جرّب تغيير الفلاتر أو العودة لعرض كل المحتوى.'
                      : 'Try changing filters or switch back to all content.'}
                  </p>
                  <Link href={`/${locale}/courses`}>
                    <Button variant="secondary">
                      {locale === 'ar' ? 'عرض كل الدورات' : 'View All Courses'}
                    </Button>
                  </Link>
                </div>
              )}

              {programs.map((program) => {
                const categoryLabel =
                  typeof program.category === 'object' && program.category
                    ? locale === 'ar'
                      ? program.category.nameAr
                      : program.category.nameEn || program.category.nameAr
                    : locale === 'ar'
                      ? 'عام'
                      : 'General';

                const instructorName = getInstructorNames(
                  program.instructor,
                  locale === 'ar' ? 'فريق نكست' : 'Next Academy Team',
                );

                const programRounds = roundsByProgram.get(program.id) || [];
                const nextRound = programRounds.find((round) => round.startDate && new Date(round.startDate) >= now);
                const fallbackRound = programRounds[0];
                const selectedRound = nextRound || fallbackRound;
                const learnersCount = programRounds.reduce((sum, round) => sum + (round.currentEnrollments || 0), 0);

                const scheduleText = selectedRound?.startDate
                  ? new Date(selectedRound.startDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : locale === 'ar'
                    ? 'سيتم الإعلان'
                    : 'Schedule soon';

                const priceText =
                  selectedRound?.price != null
                    ? `${selectedRound.price.toLocaleString()} EGP`
                    : locale === 'ar'
                      ? 'يُحدّد لاحقاً'
                      : 'TBA';

                const youtubeThumbnail = selectedRound?.meetingUrl
                  ? buildYouTubeThumbnailUrl(selectedRound.meetingUrl, 'hqdefault')
                  : null;
                const imageUrl =
                  getMediaUrl(program.thumbnail) ||
                  getMediaUrl(program.coverImage) ||
                  youtubeThumbnail;
                const typeLabel = buildPlainTypeLabel(program.type, locale);
                const title =
                  locale === 'ar'
                    ? program.titleAr || program.titleEn || 'Program'
                    : program.titleEn || program.titleAr || 'Program';

                return (
                  <article key={program.id} className={styles.card}>
                    <div className={styles.cardMedia}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={title}
                          fill
                          className={styles.cardImage}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className={styles.mediaFallback} />
                      )}
                      <span className={styles.typeBadge}>{typeLabel}</span>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.category}>{categoryLabel}</p>
                      <h2 className={styles.cardTitle}>{title}</h2>

                      <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                          <span>{locale === 'ar' ? 'المدرب' : 'Instructor'}</span>
                          <strong>{instructorName}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <span>{locale === 'ar' ? 'الدفعة' : 'Next Batch'}</span>
                          <strong>{scheduleText}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <span>{locale === 'ar' ? 'الطلاب' : 'Learners'}</span>
                          <strong>{learnersCount.toLocaleString()}</strong>
                        </div>
                        <div className={styles.metaItem}>
                          <span>{locale === 'ar' ? 'السعر' : 'Price'}</span>
                          <strong>{priceText}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardFooter}>
                      <Link href={`/${locale}/programs/${program.slug || program.id}`}>
                        <Button variant="primary" size="sm">
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
