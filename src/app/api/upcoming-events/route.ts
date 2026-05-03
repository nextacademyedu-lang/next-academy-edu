import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import type { Where } from 'payload';
import config from '@payload-config';
import type { Media, Program, Round, Event as PayloadEvent } from '@/payload-types';

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
  program?: Program;
  round?: Round | null;
  event?: PayloadEvent;
  customImage?: unknown;
  customUrl?: string;
}): EventCard {
  if (input.event) {
    const ev = input.event;
    return {
      id: ev.id,
      titleAr: ev.titleAr,
      titleEn: ev.titleEn || ev.titleAr,
      startDate: ev.eventDate,
      endDate: ev.eventEndDate || undefined,
      location: ev.venue || undefined,
      isOnline: ev.locationType === 'online',
      price: ev.price ?? undefined,
      currency: ev.currency || 'EGP',
      isFree: (ev.price ?? 0) <= 0,
      registrationUrl: input.customUrl || `/events/${ev.slug || ev.id}`,
      image: extractMediaUrl(input.customImage) || extractMediaUrl(ev.coverImage) || extractMediaUrl(ev.thumbnail),
    };
  }

  const { program, round, customImage, customUrl } = input;
  if (!program) throw new Error('Program or Event required');

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
import { cacheGetOrSet, CACHE_TTL } from '@/lib/cache';

export async function GET() {
  try {
    const data = await cacheGetOrSet(
      'upcoming-events:list',
      async () => {
        const payload = await getPayload({ config });

        // Fetch configuration (singleton-like — take first doc)
        const configResult = await payload.find({
          collection: 'upcoming-events-config',
          limit: 1,
          depth: 0,
        });

        const eventsConfig = configResult.docs[0];

        if (!eventsConfig || !eventsConfig.isEnabled) {
          return { events: [], config: null };
        }

        const maxItems = (eventsConfig.maxItems as number) || 6;
        const mode = eventsConfig.mode as string;
        const now = new Date().toISOString();

        if (mode === 'manual') {
          // Manual mode: return the manually selected items with program data
          const manualItems =
            (eventsConfig.manualItems as Array<{
              program: string | number;
              round?: string | number;
              customImage?: string | number;
              customUrl?: string;
              sortOrder?: number;
            }>) || [];

          // Sort by sortOrder
          const sorted = [...manualItems].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

          const events = await Promise.all(
            sorted.slice(0, maxItems).map(async (item) => {
              const itemType = (item as any).type || 'program';

              if (itemType === 'event') {
                const eventId = typeof (item as any).event === 'object'
                  ? (item as any).event.id
                  : (item as any).event;

                const eventDoc = (await payload.findByID({
                  collection: 'events',
                  id: eventId,
                  depth: 1,
                })) as PayloadEvent;

                return buildEventCard({
                  event: eventDoc,
                  customImage: item.customImage,
                  customUrl: item.customUrl || undefined,
                });
              }

              const programId =
                typeof item.program === 'object'
                  ? (item.program as unknown as { id: string | number }).id
                  : item.program;

              const programDoc = (await payload.findByID({
                collection: 'programs',
                id: programId,
                depth: 1,
              })) as Program;

              let roundDoc: Round | null = null;
              if (item.round) {
                const roundId =
                  typeof item.round === 'object'
                    ? (item.round as unknown as { id: string | number }).id
                    : item.round;
                roundDoc = (await payload.findByID({
                  collection: 'rounds',
                  id: roundId,
                  depth: 1,
                })) as Round;
              }

              return buildEventCard({
                program: programDoc,
                round: roundDoc,
                customImage: item.customImage,
                customUrl: item.customUrl || undefined,
              });
            })
          );

          return {
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
          };
        }

        // Automatic mode: query rounds AND events starting in the future
        const filterType = eventsConfig.filterType as string;

        const roundsWhereClause: Where = {
          and: [
            { status: { in: ['open', 'upcoming'] } },
            { startDate: { greater_than: now } },
          ],
        };

        const eventsWhereClause: Where = {
          and: [
            { isActive: { equals: true } },
            { eventDate: { greater_than: now } },
          ],
        };

        if (filterType && filterType !== 'all') {
          if (roundsWhereClause.and) {
            roundsWhereClause.and.push({ type: { equals: filterType } });
          }
          if (eventsWhereClause.and) {
            eventsWhereClause.and.push({ type: { equals: filterType } });
          }
        }

        const roundsPromise = payload.find({
          collection: 'rounds',
          where: roundsWhereClause,
          sort: 'startDate',
          limit: maxItems,
          depth: 2,
        });

        const eventsPromise = payload.find({
          collection: 'events',
          where: eventsWhereClause,
          sort: 'eventDate',
          limit: maxItems,
          depth: 2,
        });

        const [roundsRes, eventsRes] = await Promise.all([roundsPromise, eventsPromise]);

        const upcomingRounds = roundsRes.docs
          .map((round) => {
            const program = typeof round.program === 'object' ? (round.program as Program) : null;
            if (!program) return null;
            return buildEventCard({ program, round: round as Round });
          })
          .filter(Boolean) as EventCard[];

        const upcomingStandaloneEvents = eventsRes.docs
          .map((ev) => buildEventCard({ event: ev as PayloadEvent }))
          .filter(Boolean) as EventCard[];

        // Combine, sort by date, and take top maxItems
        const events = [...upcomingRounds, ...upcomingStandaloneEvents]
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, maxItems);

        return {
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
        };
      },
      { ttl: CACHE_TTL.HOMEPAGE }
    );

    return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/upcoming-events]', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming events' },
      { status: 500 }
    );
  }
}
