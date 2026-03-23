import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

export async function GET() {
  try {
    const payload = await getPayload({ config });

    const { docs } = await payload.find({
      collection: 'blog-posts',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 8,
      depth: 1,
    });

    const posts = docs.map((doc) => {
      const image = doc.featuredImage as { url?: string } | undefined;
      return {
        id: doc.id,
        title: doc.title,
        category: doc.category ?? '',
        excerpt: doc.excerpt ?? '',
        date: doc.publishedAt ?? '',
        slug: doc.slug,
        image: image?.url ?? null,
      };
    });

    return NextResponse.json({ posts }, { headers: PUBLIC_CACHE_HEADERS });
  } catch {
    return NextResponse.json({ posts: [] }, { headers: PUBLIC_CACHE_HEADERS });
  }
}
