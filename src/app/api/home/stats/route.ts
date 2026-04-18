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

// ── In-memory cache to avoid hammering DB on every homepage load ─────────────
let memoryCache: { data: StatsResponse; expiresAt: number } | null = null;
const MEMORY_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function safeCount(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  where?: Record<string, unknown>,
): Promise<number> {
  try {
    const result = await payload.find({
      collection: collection as 'bookings',
      where: where as never,
      depth: 0,
      limit: 1,
    });
    return result.totalDocs;
  } catch (err) {
    console.error(`[api/home/stats] ${collection} query failed:`, err);
    return 0;
  }
}

export async function GET() {
  try {
    // Return cached data if still fresh
    if (memoryCache && Date.now() < memoryCache.expiresAt) {
      return NextResponse.json(
        { stats: memoryCache.data },
        { headers: PUBLIC_CACHE_HEADERS },
      );
    }

    const payload = await getPayload({ config });

    // Run queries sequentially instead of in parallel to avoid pool exhaustion
    const completedBookings = await safeCount(payload, 'bookings', {
      status: { equals: 'completed' },
    });
    const successfulBookings = await safeCount(payload, 'bookings', {
      status: { in: ['confirmed', 'completed'] },
    });
    const partners = await safeCount(payload, 'companies');
    const instructors = await safeCount(payload, 'instructors', {
      isActive: { equals: true },
    });

    const completionRate =
      successfulBookings > 0
        ? Math.round((completedBookings / successfulBookings) * 100)
        : 0;

    const stats: StatsResponse = {
      professionals: successfulBookings,
      partners,
      instructors,
      completionRate,
    };

    // Cache in memory
    memoryCache = {
      data: stats,
      expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
    };

    return NextResponse.json({ stats }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/home/stats] Failed to build home stats:', error);

    // If we have stale cache, return it instead of erroring
    if (memoryCache) {
      return NextResponse.json(
        { stats: memoryCache.data },
        { headers: PUBLIC_CACHE_HEADERS },
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch home stats' },
      { status: 500 },
    );
  }
}
