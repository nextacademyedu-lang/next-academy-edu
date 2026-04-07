import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { Category, Instructor, Media, Program, Review, Round } from '@/payload-types';
import { buildYouTubeThumbnailUrl } from '@/lib/youtube';

type FeaturedCard = {
  id: string;
  title: string;
  kind: string;
  category: string;
  audienceCount: number;
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
  viewCount?: number | null;
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
    if (type === 'event') return 'فعالية';
    if (type === 'camp') return 'معسكر';
    if (type === 'retreat') return 'خلوة';
    if (type === 'corporate_training') return 'تدريب مؤسسي';
    return 'ندوة';
  }

  if (type === 'course') return 'Course';
  if (type === 'workshop') return 'Workshop';
  if (type === 'event') return 'Event';
  if (type === 'camp') return 'Camp';
  if (type === 'retreat') return 'Retreat';
  if (type === 'corporate_training') return 'Corporate Training';
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
  const fallback = locale === 'ar' ? 'فريق نكست' : 'Next Team';
  if (!instructor) return fallback;

  // hasMany field: instructor is an array
  const items = Array.isArray(instructor) ? instructor : [instructor];
  const names: string[] = [];
  for (const item of items) {
    if (item && typeof item === 'object' && 'firstName' in item) {
      const doc = item as Instructor;
      const fullName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim();
      if (fullName) names.push(fullName);
    }
  }

  return names.length > 0 ? names.join(', ') : fallback;
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
    (a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime(),
  );
  const upcoming = sorted.find((round) => {
    const status = round.status || 'draft';
    if (status === 'cancelled' || status === 'draft') return false;
    return round.startDate && new Date(round.startDate).getTime() >= now;
  });

  return upcoming || sorted[0] || null;
}

function pickUpcomingRound(rounds: Round[]): Round | null {
  const now = Date.now();
  const sorted = [...rounds].sort(
    (a, b) => new Date(a.startDate ?? 0).getTime() - new Date(b.startDate ?? 0).getTime(),
  );

  return (
    sorted.find((round) => {
      const status = round.status || 'draft';
      if (status === 'cancelled' || status === 'draft') return false;
      if (!round.startDate) return false;
      return new Date(round.startDate).getTime() >= now;
    }) || null
  );
}

function pickRecordedRound(rounds: Round[]): Round | null {
  const now = Date.now();
  const sorted = [...rounds].sort(
    (a, b) => new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime(),
  );

  return (
    sorted.find((round) => {
      const hasRecording = typeof round.meetingUrl === 'string' && round.meetingUrl.trim().length > 0;
      if (!hasRecording) return false;
      const isPastRound = round.startDate ? new Date(round.startDate).getTime() < now : false;
      return round.status === 'completed' || isPastRound;
    }) || null
  );
}

function pickCardImage(program: Program, round: Round | null): string | null {
  const mediaImage = mediaUrl(program.thumbnail) || mediaUrl(program.coverImage);
  if (mediaImage) return mediaImage;

  if (round?.meetingUrl) {
    return buildYouTubeThumbnailUrl(round.meetingUrl, 'hqdefault');
  }

  return null;
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
      return NextResponse.json(
        { upcomingPrograms: [], recordedPrograms: [] },
        { headers: PUBLIC_CACHE_HEADERS },
      );
    }

    const programIds = programs.map((program) => program.id);

    const [roundsSettled, reviewsSettled] = await Promise.allSettled([
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

    const roundsResult = roundsSettled.status === 'fulfilled'
      ? roundsSettled.value
      : { docs: [] as Round[] };
    const reviewsResult = reviewsSettled.status === 'fulfilled'
      ? reviewsSettled.value
      : { docs: [] as Review[] };

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

    const upcomingPrograms: FeaturedCard[] = [];
    const recordedPrograms: FeaturedCard[] = [];

    programs.forEach((rawProgram) => {
      const program = rawProgram as ProgramWithDerived;
      const rounds = roundsByProgram.get(program.id) || [];
      const upcomingRound = pickUpcomingRound(rounds);
      const recordedRound = pickRecordedRound(rounds);
      const selectedRound = upcomingRound || pickBestRound(rounds);
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

      const baseCard = {
        id: String(program.id),
        title,
        kind: typeLabel(program.type, locale),
        category: categoryLabel(program.category, locale),
        audienceCount: enrollmentsFromRounds || program.learnersCount || 0,
        rating,
        ratingCount,
        instructor: instructorLabel(program.instructor, locale),
        date: roundLabel(selectedRound, locale),
        price: priceLabel(selectedRound, locale),
        image: pickCardImage(program, selectedRound),
      };

      if (upcomingRound) {
        upcomingPrograms.push({
          ...baseCard,
          date: roundLabel(upcomingRound, locale),
          price: priceLabel(upcomingRound, locale),
          image: pickCardImage(program, upcomingRound),
          href: `/${locale}/programs/${program.slug || program.id}`,
        });
      }

      if (!upcomingRound && recordedRound) {
        const viewsCount = Math.max(program.viewCount || 0, enrollmentsFromRounds || 0);
        recordedPrograms.push({
          ...baseCard,
          audienceCount: viewsCount,
          date: roundLabel(recordedRound, locale),
          price: priceLabel(recordedRound, locale),
          image: pickCardImage(program, recordedRound),
          href: `/${locale}/programs/${program.slug || program.id}#recording-${recordedRound.id}`,
        });
      }
    });

    return NextResponse.json(
      {
        upcomingPrograms: upcomingPrograms.slice(0, limit),
        recordedPrograms: recordedPrograms.slice(0, limit),
      },
      { headers: PUBLIC_CACHE_HEADERS },
    );
  } catch (error) {
    console.error('[api/home/featured-programs] Failed to fetch cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured programs' },
      { status: 500 },
    );
  }
}
