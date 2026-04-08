import { NextRequest, NextResponse } from 'next/server';
import type { Booking, Program, Round, User, UserProfile } from '@/payload-types';
import {
  getCompanyUserIds,
  relationToId,
  resolveB2BScope,
} from '../_scope.ts';

const TRACKED_BOOKING_STATUSES: Booking['status'][] = [
  'reserved',
  'pending',
  'confirmed',
  'completed',
];

type TeamStat = {
  bookingsCount: number;
  lastBookingDate?: string;
};

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

function mapProgram(programRelation: Round['program']): {
  id: string;
  titleAr: string;
  titleEn?: string;
  type: string;
} | string {
  if (typeof programRelation === 'number') return String(programRelation);

  const program = programRelation as Program;
  return {
    id: String(program.id),
    titleAr: program.titleAr || '',
    titleEn: program.titleEn || undefined,
    type: program.type || 'course',
  };
}

function mapBooking(booking: Booking) {
  const user =
    typeof booking.user === 'number'
      ? String(booking.user)
      : {
          id: String(booking.user.id),
          firstName: booking.user.firstName || 'User',
          lastName: booking.user.lastName || '',
          email: booking.user.email || '',
        };

  const round =
    !booking.round
      ? undefined
      : typeof booking.round === 'number'
        ? String(booking.round)
        : {
            id: String(booking.round.id),
            title: booking.round.title || undefined,
            startDate: booking.round.startDate,
            program: mapProgram(booking.round.program),
          };

  return {
    id: String(booking.id),
    bookingCode: booking.bookingCode || `BK-${booking.id}`,
    status: booking.status,
    totalAmount: booking.totalAmount || 0,
    paidAmount: booking.paidAmount || 0,
    createdAt: booking.createdAt,
    user,
    round,
  };
}

async function fetchAllCompanyBookings(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  companyUserIds: number[],
) {
  if (!companyUserIds.length) return [] as Booking[];

  const docs: Booking[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { user: { in: companyUserIds } },
          { status: { in: TRACKED_BOOKING_STATUSES } },
        ],
      },
      sort: '-createdAt',
      depth: 2,
      limit: 200,
      page,
      overrideAccess: true,
    });

    docs.push(...(result.docs as Booking[]));
    totalPages = result.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return docs;
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, company, companyId } = scope;
    const companyUserIds = await getCompanyUserIds(payload, companyId);

    const [teamResult, allCompanyBookings] = await Promise.all([
      payload.find({
        collection: 'user-profiles',
        where: { company: { equals: companyId } },
        sort: '-updatedAt',
        depth: 1,
        limit: 20,
        page: 1,
        overrideAccess: true,
      }),
      fetchAllCompanyBookings(payload, companyUserIds),
    ]);

    const teamStats = new Map<number, TeamStat>();
    const activeProgramIds = new Set<number>();
    let totalSpent = 0;

    for (const booking of allCompanyBookings) {
      const userId = relationToId(booking.user);
      if (userId) {
        const prev = teamStats.get(userId) || { bookingsCount: 0 };
        const nextLast =
          !prev.lastBookingDate || new Date(booking.createdAt) > new Date(prev.lastBookingDate)
            ? booking.createdAt
            : prev.lastBookingDate;

        teamStats.set(userId, {
          bookingsCount: prev.bookingsCount + 1,
          lastBookingDate: nextLast,
        });
      }

      totalSpent += booking.paidAmount || 0;

      if (booking.round && typeof booking.round !== 'number') {
        const programId = relationToId(booking.round.program);
        if (programId) activeProgramIds.add(programId);
      }
    }

    const teamMembers = (teamResult.docs as UserProfile[])
      .map((profile) => {
        const user = mapTeamUser(profile.user);
        const userId = relationToId(profile.user);
        const stats = userId ? teamStats.get(userId) : undefined;

        return {
          user,
          profile: {
            jobTitle: profile.jobTitle || undefined,
            title: profile.title || undefined,
          },
          bookings_count: stats?.bookingsCount || 0,
          last_booking_date: stats?.lastBookingDate,
        };
      })
      .filter((member) => Boolean(member.user.id));

    const data = {
      company: {
        id: String(company.id),
        name: company.name,
        industry: company.industry || undefined,
        size: company.size || undefined,
        type: company.type || undefined,
        country: company.country || undefined,
        city: company.city || undefined,
      },
      team_members: teamMembers,
      stats: {
        total_bookings: allCompanyBookings.length,
        total_spent: totalSpent,
        active_programs: activeProgramIds.size,
        team_size: companyUserIds.length,
      },
      recent_bookings: allCompanyBookings.slice(0, 10).map(mapBooking),
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('[api/b2b/dashboard]', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B dashboard data' },
      { status: 500 },
    );
  }
}
