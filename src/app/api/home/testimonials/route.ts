import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

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
      const user = doc.user as { name?: string; email?: string } | undefined;
      const name = user?.name || user?.email?.split('@')[0] || 'Anonymous';
      return {
        text: doc.comment,
        name,
        avatar: getInitials(name),
        rating: doc.rating,
      };
    });

    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json({ testimonials: [] });
  }
}
