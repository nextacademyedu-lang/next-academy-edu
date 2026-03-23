import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Category, Instructor, Media, Program, Review, Round } from '@/payload-types';

type FeaturedCard = {
  id: string;
  title: string;
  kind: string;
  category: string;
  enrolledCount: number;
  rating: number;
  ratingCount: number;
  instructor: string;
  date: string;
  price: string;
  image: string | null;
  href: string;
};

type ProgramWithDerived = Program & {
  learnersCount?: number | null;
};

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

function mediaUrl(value: Program['thumbnail'] | Program['coverImage']): string | null {
  if (!value || typeof value === 'number') return null;
  return (value as Media).url || null;
}

function typeLabel(type: Program['type'], locale: 'ar' | 'en'): string {
  if (locale === 'ar') {
    if (type === 'course') return 'دورة';
    if (type === 'workshop') return 'ورشة';
    return 'ندوة';
  }

  if (type === 'course') return 'Course';
  if (type === 'workshop') return 'Workshop';
  return 'Webinar';
}

function categoryLabel(category: Program['category'], locale: 'ar' | 'en'): string {
  if (!category || typeof category === 'number') return locale === 'ar' ? 'عام' : 'General';
  const categoryDoc = category as Category;
  return locale === 'ar'
    ? categoryDoc.nameAr
    : categoryDoc.nameEn || categoryDoc.nameAr || 'General';
}

function instructorLabel(instructor: Program['instructor'], locale: 'ar' | 'en'): string {
  if (!instructor || typeof instructor === 'number') {
    return locale === 'ar' ? 'فريق نكست' : 'Next Team';
  }

  const doc = instructor as Instructor;
  const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
  return fullName || (locale === 'ar' ? 'فريق نكست' : 'Next Team');
}

function roundLabel(round: Round | null, locale: 'ar' | 'en'): string {
  if (!round?.startDate) return locale === 'ar' ? 'سيتم الإعلان' : 'Schedule soon';

  const dateLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  const start = new Date(round.startDate).toLocaleDateString(dateLocale, {
    month: 'short',
    day: 'numeric',
  });

  if (!round.endDate) return start;

  const end = new Date(round.endDate).toLocaleDateString(dateLocale, {
    month: 'short',
    day: 'numeric',
  });

  return `${start} - ${end}`;
}

function priceLabel(round: Round | null, locale: 'ar' | 'en'): string {
  if (!round || round.price == null) return locale === 'ar' ? 'يُحدّد لاحقاً' : 'TBA';
  const currency = round.currency || 'EGP';
  return `${round.price.toLocaleString()} ${currency}`;
}

function pickBestRound(rounds: Round[]): Round | null {
  if (!rounds.length) return null;

  const now = Date.now();
  const sorted = [...rounds].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const upcoming = sorted.find((round) => {
    const status = round.status || 'draft';
    if (status === 'cancelled' || status === 'draft') return false;
    return new Date(round.startDate).getTime() >= now;
  });

  return upcoming || sorted[0] || null;
}

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const localeParam = (req.nextUrl.searchParams.get('locale') || 'en').toLowerCase();
    const locale: 'ar' | 'en' = localeParam === 'ar' ? 'ar' : 'en';

    const limitParam = Number(req.nextUrl.searchParams.get('limit') || 8);
    const limit = Number.isFinite(limitParam)
      ? Math.max(1, Math.min(20, Math.floor(limitParam)))
      : 8;

    const featured = await payload.find({
      collection: 'programs',
      where: {
        and: [
          { isActive: { equals: true } },
          { isFeatured: { equals: true } },
        ],
      },
      depth: 2,
      sort: 'featuredPriority',
      limit,
    });

    let programs = featured.docs as Program[];

    if (programs.length < limit) {
      const filler = await payload.find({
        collection: 'programs',
        where: {
          and: [
            { isActive: { equals: true } },
            programs.length > 0
              ? { id: { not_in: programs.map((p) => p.id) } }
              : { id: { exists: true } },
          ],
        },
        depth: 2,
        sort: '-createdAt',
        limit: limit - programs.length,
      });
      programs = [...programs, ...(filler.docs as Program[])];
    }

    if (programs.length === 0) {
      return NextResponse.json({ programs: [] }, { headers: PUBLIC_CACHE_HEADERS });
    }

    const programIds = programs.map((program) => program.id);

    const [roundsResult, reviewsResult] = await Promise.all([
      payload.find({
        collection: 'rounds',
        where: { program: { in: programIds } },
        depth: 0,
        sort: 'startDate',
        limit: 1000,
      }),
      payload.find({
        collection: 'reviews',
        where: {
          and: [
            { program: { in: programIds } },
            { status: { equals: 'approved' } },
          ],
        },
        depth: 0,
        limit: 2000,
      }),
    ]);

    const roundsByProgram = new Map<number, Round[]>();
    for (const roundDoc of roundsResult.docs as Round[]) {
      const programId = typeof roundDoc.program === 'number'
        ? roundDoc.program
        : roundDoc.program?.id;
      if (!programId) continue;
      const current = roundsByProgram.get(programId) || [];
      current.push(roundDoc);
      roundsByProgram.set(programId, current);
    }

    const reviewStats = new Map<number, { total: number; count: number }>();
    for (const review of reviewsResult.docs as Review[]) {
      const programId = typeof review.program === 'number'
        ? review.program
        : review.program?.id;
      if (!programId) continue;
      const current = reviewStats.get(programId) || { total: 0, count: 0 };
      current.total += review.rating || 0;
      current.count += 1;
      reviewStats.set(programId, current);
    }

    const mapped: FeaturedCard[] = programs.map((rawProgram) => {
      const program = rawProgram as ProgramWithDerived;
      const rounds = roundsByProgram.get(program.id) || [];
      const selectedRound = pickBestRound(rounds);
      const enrollmentsFromRounds = rounds.reduce(
        (sum, round) => sum + (round.currentEnrollments || 0),
        0,
      );

      const review = reviewStats.get(program.id);
      const ratingCount = review?.count ?? (program.reviewCount || 0);
      const ratingRaw = review?.count
        ? review.total / review.count
        : (program.averageRating || 0);
      const rating = Number(ratingRaw.toFixed(1));

      const title = locale === 'ar'
        ? (program.titleAr || program.titleEn || 'برنامج')
        : (program.titleEn || program.titleAr || 'Program');

      return {
        id: String(program.id),
        title,
        kind: typeLabel(program.type, locale),
        category: categoryLabel(program.category, locale),
        enrolledCount: enrollmentsFromRounds || program.learnersCount || 0,
        rating,
        ratingCount,
        instructor: instructorLabel(program.instructor, locale),
        date: roundLabel(selectedRound, locale),
        price: priceLabel(selectedRound, locale),
        image: mediaUrl(program.thumbnail) || mediaUrl(program.coverImage),
        href: `/${locale}/programs/${program.slug || program.id}`,
      };
    });

    return NextResponse.json({ programs: mapped }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/home/featured-programs] Failed to fetch cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured programs' },
      { status: 500 },
    );
  }
}
