import { NextRequest, NextResponse } from 'next/server';
import type { Where } from 'payload';
import type { Booking, Program, Round, User } from '@/payload-types';
import {
  getCompanyUserIds,
  parsePagination,
  resolveB2BScope,
} from '../_scope.ts';

const UPCOMING_STATUSES: Booking['status'][] = ['reserved', 'pending', 'confirmed'];

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
          id: String((booking.user as User).id),
          firstName: (booking.user as User).firstName || 'User',
          lastName: (booking.user as User).lastName || '',
          email: (booking.user as User).email || '',
        };

  const round =
    typeof booking.round === 'number'
      ? String(booking.round)
      : {
          id: String((booking.round as Round).id),
          title: (booking.round as Round).title || undefined,
          startDate: (booking.round as Round).startDate,
          program: mapProgram((booking.round as Round).program),
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

function getStatusFilter(statusParam: string | null): Booking['status'][] | null {
  if (!statusParam || statusParam === 'all') return null;
  if (statusParam === 'upcoming') return UPCOMING_STATUSES;
  if (statusParam === 'completed') return ['completed'];

  const raw = statusParam as Booking['status'];
  const all: Booking['status'][] = [
    'reserved',
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'refunded',
    'payment_failed',
    'cancelled_overdue',
  ];

  return all.includes(raw) ? [raw] : null;
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, companyId } = scope;
    const { page, limit } = parsePagination(req, 20, 100);
    const companyUserIds = await getCompanyUserIds(payload, companyId);

    if (!companyUserIds.length) {
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        limit,
        page,
        totalPages: 1,
      });
    }

    const statusFilter = getStatusFilter(req.nextUrl.searchParams.get('status'));
    const whereClause: Where =
      statusFilter && statusFilter.length > 0
        ? {
            and: [
              { user: { in: companyUserIds } },
              { status: { in: statusFilter } },
            ],
          }
        : { user: { in: companyUserIds } };

    const bookingsResult = await payload.find({
      collection: 'bookings',
      where: whereClause,
      sort: '-createdAt',
      depth: 2,
      limit,
      page,
      overrideAccess: true,
    });

    return NextResponse.json({
      docs: (bookingsResult.docs as Booking[]).map(mapBooking),
      totalDocs: bookingsResult.totalDocs,
      limit: bookingsResult.limit,
      page: bookingsResult.page,
      totalPages: bookingsResult.totalPages,
    });
  } catch (error) {
    console.error('[api/b2b/bookings]', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B bookings' },
      { status: 500 },
    );
  }
}
