import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

import { cacheGetOrSet, CACHE_TTL } from '@/lib/cache';

export async function GET() {
  try {
    const data = await cacheGetOrSet(
      'instructors:list',
      async () => {
        const payload = await getPayload({ config });

        const { docs } = await payload.find({
          collection: 'instructors',
          where: { isActive: { equals: true } },
          sort: 'featuredOrder',
          limit: 8,
          depth: 1,
        });

        const instructors = docs.map((doc) => {
          const picture = doc.picture as { url?: string } | undefined;
          return {
            id: doc.id,
            name: `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim(),
            title: doc.jobTitle ?? '',
            tagline: doc.tagline ?? '',
            image: picture?.url ?? null,
            slug: doc.slug,
            linkedinUrl: doc.linkedinUrl ?? null,
          };
        });

        return { instructors };
      },
      { ttl: CACHE_TTL.INSTRUCTORS_LIST }
    );

    return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADERS });
  } catch {
    return NextResponse.json({ instructors: [] });
  }
}
