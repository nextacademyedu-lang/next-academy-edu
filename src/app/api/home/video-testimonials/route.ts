import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET() {
  try {
    const payload = await getPayload({ config });

    const { docs } = await payload.find({
      collection: 'reviews',
      where: {
        isVideoTestimonial: { equals: true },
        status: { equals: 'approved' },
      },
      depth: 1,
      limit: 8,
      sort: '-createdAt',
    });

    const videos = docs.map((doc) => {
      const thumbnail = doc.videoThumbnail as { url?: string } | undefined;
      return {
        id: doc.id,
        videoUrl: doc.videoUrl ?? '',
        thumbnail: thumbnail?.url ?? null,
        captionTitle: doc.videoCaption ?? '',
        captionSubtitle: doc.videoSubtitle ?? '',
      };
    });

    return NextResponse.json({ videos });
  } catch {
    return NextResponse.json({ videos: [] });
  }
}
