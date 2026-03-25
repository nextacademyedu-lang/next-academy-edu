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

    const results = await Promise.allSettled([
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

    const safeTotal = (r: PromiseSettledResult<{ totalDocs: number }>) =>
      r.status === 'fulfilled' ? r.value.totalDocs : 0;

    // Log any individual failures without breaking the whole response
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        const labels = ['completedBookings', 'successfulBookings', 'companies', 'instructors'];
        console.error(`[api/home/stats] ${labels[i]} query failed:`, r.reason);
      }
    });

    const professionals = safeTotal(results[1]);
    const partners = safeTotal(results[2]);
    const instructors = safeTotal(results[3]);
    const completionRate = professionals > 0
      ? Math.round((safeTotal(results[0]) / professionals) * 100)
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

