import { NextRequest, NextResponse } from 'next/server';
import type { Booking, User, UserProfile } from '@/payload-types';
import {
  parsePagination,
  relationToId,
  resolveB2BScope,
} from '../_scope.ts';

const TRACKED_BOOKING_STATUSES: Booking['status'][] = [
  'reserved',
  'pending',
  'confirmed',
  'completed',
];

function mapTeamUser(userRelation: UserProfile['user']) {
  if (typeof userRelation === 'number') {
    return {
      id: String(userRelation),
      firstName: 'User',
      lastName: String(userRelation),
      email: '',
    };
  }

  const user = userRelation as User;
  return {
    id: String(user.id),
    firstName: user.firstName || 'User',
    lastName: user.lastName || '',
    email: user.email || '',
  };
}

async function fetchUserBookingStats(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  userIds: number[],
) {
  const stats = new Map<number, { bookingsCount: number; lastBookingDate?: string }>();
  if (!userIds.length) return stats;

  let page = 1;
  let totalPages = 1;

  do {
    const result = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { user: { in: userIds } },
          { status: { in: TRACKED_BOOKING_STATUSES } },
        ],
      },
      sort: '-createdAt',
      depth: 0,
      limit: 200,
      page,
      overrideAccess: true,
    });

    for (const booking of result.docs as Booking[]) {
      const userId = relationToId(booking.user);
      if (!userId) continue;

      const prev = stats.get(userId) || { bookingsCount: 0 };
      const lastBookingDate =
        !prev.lastBookingDate || new Date(booking.createdAt) > new Date(prev.lastBookingDate)
          ? booking.createdAt
          : prev.lastBookingDate;

      stats.set(userId, {
        bookingsCount: prev.bookingsCount + 1,
        lastBookingDate,
      });
    }

    totalPages = result.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return stats;
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, companyId } = scope;
    const { page, limit } = parsePagination(req, 20, 100);

    const teamResult = await payload.find({
      collection: 'user-profiles',
      where: { company: { equals: companyId } },
      sort: '-updatedAt',
      depth: 1,
      limit,
      page,
      overrideAccess: true,
    });

    const pageUserIds = (teamResult.docs as UserProfile[])
      .map((profile) => relationToId(profile.user))
      .filter((id): id is number => Boolean(id));

    const bookingStats = await fetchUserBookingStats(payload, pageUserIds);

    const docs = (teamResult.docs as UserProfile[]).map((profile) => {
      const user = mapTeamUser(profile.user);
      const userId = relationToId(profile.user);
      const stats = userId ? bookingStats.get(userId) : undefined;

      return {
        user,
        profile: {
          jobTitle: profile.jobTitle || undefined,
          title: profile.title || undefined,
        },
        bookings_count: stats?.bookingsCount || 0,
        last_booking_date: stats?.lastBookingDate,
      };
    });

    return NextResponse.json({
      docs,
      totalDocs: teamResult.totalDocs,
      limit: teamResult.limit,
      page: teamResult.page,
      totalPages: teamResult.totalPages,
    });
  } catch (error) {
    console.error('[api/b2b/team]', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B team data' },
      { status: 500 },
    );
  }
}
