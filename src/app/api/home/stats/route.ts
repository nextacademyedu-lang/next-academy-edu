import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

type StatsResponse = {
  professionals: number;
  partners: number;
  instructors: number;
  completionRate: number;
};

export async function GET() {
  try {
    const payload = await getPayload({ config });

    const [
      completedBookings,
      successfulBookings,
      companies,
      activeInstructors,
    ] = await Promise.all([
      payload.find({
        collection: 'bookings',
        where: { status: { equals: 'completed' } },
        depth: 0,
        limit: 1,
      }),
      payload.find({
        collection: 'bookings',
        where: { status: { in: ['confirmed', 'completed'] } },
        depth: 0,
        limit: 1,
      }),
      payload.find({
        collection: 'companies',
        depth: 0,
        limit: 1,
      }),
      payload.find({
        collection: 'instructors',
        where: { isActive: { equals: true } },
        depth: 0,
        limit: 1,
      }),
    ]);

    const professionals = successfulBookings.totalDocs || 0;
    const partners = companies.totalDocs || 0;
    const instructors = activeInstructors.totalDocs || 0;
    const completionRate = professionals > 0
      ? Math.round(((completedBookings.totalDocs || 0) / professionals) * 100)
      : 0;

    const stats: StatsResponse = {
      professionals,
      partners,
      instructors,
      completionRate,
    };

    return NextResponse.json({ stats }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/home/stats] Failed to build home stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch home stats' },
      { status: 500 },
    );
  }
}

