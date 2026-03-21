import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET() {
  try {
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

    return NextResponse.json({ instructors });
  } catch {
    return NextResponse.json({ instructors: [] });
  }
}
