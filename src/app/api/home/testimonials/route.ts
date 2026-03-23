import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
};

type RelatedUser = {
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

function buildDisplayName(user?: RelatedUser): string {
  if (!user) return 'Anonymous';

  const explicitName = user.name?.trim();
  if (explicitName) return explicitName;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;

  const emailName = user.email?.split('@')[0]?.trim();
  if (emailName) return emailName;

  return 'Anonymous';
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

export async function GET() {
  try {
    const payload = await getPayload({ config });

    const { docs } = await payload.find({
      collection: 'reviews',
      where: { status: { equals: 'approved' } },
      depth: 1,
      limit: 10,
      sort: '-createdAt',
    });

    const testimonials = docs.map((doc) => {
      const user = typeof doc.user === 'object' && doc.user !== null
        ? doc.user as RelatedUser
        : undefined;
      const name = buildDisplayName(user);
      const rating = Math.max(1, Math.min(5, Number(doc.rating) || 5));

      return {
        text: doc.comment,
        name,
        avatar: getInitials(name),
        rating,
      };
    });

    return NextResponse.json({ testimonials }, { headers: PUBLIC_CACHE_HEADERS });
  } catch {
    return NextResponse.json({ testimonials: [] }, { headers: PUBLIC_CACHE_HEADERS });
  }
}
