import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@payload-config';
import type { Media, Program, Round } from '@/payload-types';

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

type EventCard = {
  id: string | number;
  titleAr: string;
  titleEn: string;
  startDate: string;
  endDate?: string;
  location?: string;
  isOnline?: boolean;
  price?: number;
  currency?: string;
  isFree?: boolean;
  registrationUrl?: string;
  image?: string;
};

function extractMediaUrl(value: unknown): string | undefined {
  if (!value || typeof value === 'number') return undefined;
  return (value as Media).url || undefined;
}

function buildEventCard(input: {
  program: Program;
  round: Round | null;
  customImage?: unknown;
  customUrl?: string;
}): EventCard {
  const { program, round, customImage, customUrl } = input;
  const location = round?.locationName || round?.locationAddress || undefined;
  const image = extractMediaUrl(customImage)
    || extractMediaUrl(program.coverImage)
    || extractMediaUrl(program.thumbnail);

  return {
    id: round?.id || program.id,
    titleAr: program.titleAr || 'برنامج',
    titleEn: program.titleEn || program.titleAr || 'Program',
    startDate: round?.startDate || new Date().toISOString(),
    endDate: round?.endDate || undefined,
    location,
    isOnline: round?.locationType === 'online',
    price: round?.price ?? undefined,
    currency: round?.currency || 'EGP',
    isFree: (round?.price ?? 0) <= 0,
    registrationUrl: customUrl || `/${program.slug ? `programs/${program.slug}` : `programs/${program.id}`}`,
    image,
  };
}

/**
 * GET /api/upcoming-events
 * Returns upcoming events based on the UpcomingEventsConfig collection.
 * - Automatic mode: queries rounds with future start dates
 * - Manual mode: returns manually selected programs/rounds
 */
export async function GET() {
  try {
    const payload = await getPayload({ config });

    // Fetch configuration (singleton-like — take first doc)
    const configResult = await payload.find({
      collection: 'upcoming-events-config',
      limit: 1,
      depth: 0,
    });

    const eventsConfig = configResult.docs[0];

    if (!eventsConfig || !eventsConfig.isEnabled) {
      return NextResponse.json({ events: [], config: null }, { headers: PUBLIC_CACHE_HEADERS });
    }

    const maxItems = (eventsConfig.maxItems as number) || 6;
    const mode = eventsConfig.mode as string;
    const now = new Date().toISOString();

    if (mode === 'manual') {
      // Manual mode: return the manually selected items with program data
      const manualItems = (eventsConfig.manualItems as Array<{
        program: string | number;
        round?: string | number;
        customImage?: string | number;
        customUrl?: string;
        sortOrder?: number;
      }>) || [];

      // Sort by sortOrder
      const sorted = [...manualItems].sort(
        (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
      );

      // Populate program data
      const events = await Promise.all(
        sorted.slice(0, maxItems).map(async (item) => {
          const programId = typeof item.program === 'object'
            ? (item.program as unknown as { id: string | number }).id
            : item.program;

          const programDoc = await payload.findByID({
            collection: 'programs',
            id: programId,
            depth: 1,
          }) as Program;

          let roundDoc: Round | null = null;
          if (item.round) {
            const roundId = typeof item.round === 'object'
              ? (item.round as unknown as { id: string | number }).id
              : item.round;
            roundDoc = await payload.findByID({
              collection: 'rounds',
              id: roundId,
              depth: 1,
            }) as Round;
          }

          return buildEventCard({
            program: programDoc,
            round: roundDoc,
            customImage: item.customImage,
            customUrl: item.customUrl || undefined,
          });
        }),
      );

      return NextResponse.json({
        events,
        config: {
          sectionTitleAr: eventsConfig.sectionTitleAr,
          sectionTitleEn: eventsConfig.sectionTitleEn,
          autoPlaySpeed: eventsConfig.autoPlaySpeed,
          cardDisplay: eventsConfig.cardDisplay,
          viewAllLink: eventsConfig.viewAllLink,
          emptyMessageAr: eventsConfig.emptyMessageAr,
          emptyMessageEn: eventsConfig.emptyMessageEn,
        },
      }, { headers: PUBLIC_CACHE_HEADERS });
    }

    // Automatic mode: query rounds starting in the future
    const filterType = eventsConfig.filterType as string;

    const whereClause: Where = {
      and: [
        { status: { in: ['open', 'upcoming'] } },
        { startDate: { greater_than: now } },
      ],
    };

    if (filterType && filterType !== 'all' && whereClause.and) {
      whereClause.and.push({ type: { equals: filterType } });
    }

    const sortOrder = eventsConfig.sortOrder === 'date_asc' ? 'startDate' : 'sortOrder';

    const rounds = await payload.find({
      collection: 'rounds',
      where: whereClause,
      sort: sortOrder,
      limit: maxItems,
      depth: 2, // populate program + instructor
    });

    const events = rounds.docs
      .map((round) => {
        const program = typeof round.program === 'object'
          ? round.program as Program
          : null;
        if (!program) return null;
        return buildEventCard({
          program,
          round: round as Round,
        });
      })
      .filter(Boolean);

    return NextResponse.json({
      events,
      config: {
        sectionTitleAr: eventsConfig.sectionTitleAr,
        sectionTitleEn: eventsConfig.sectionTitleEn,
        autoPlaySpeed: eventsConfig.autoPlaySpeed,
        cardDisplay: eventsConfig.cardDisplay,
        viewAllLink: eventsConfig.viewAllLink,
        emptyMessageAr: eventsConfig.emptyMessageAr,
        emptyMessageEn: eventsConfig.emptyMessageEn,
      },
    }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/upcoming-events]', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 },
    );
  }
}
