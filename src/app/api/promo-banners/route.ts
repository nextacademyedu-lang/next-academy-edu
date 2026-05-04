import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=30',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    const position = searchParams.get('position') || 'after_events';

    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: 'promo-banners',
      where: {
        and: [
          { isActive: { equals: true } },
          {
            or: [
              { page: { equals: page } },
              { page: { equals: 'all' } },
            ],
          },
          { position: { equals: position } },
        ],
      },
      sort: 'sortOrder',
      limit: 20,
      depth: 1,
    });

    const banners = result.docs.map((doc: any) => ({
      id: doc.id,
      titleAr: doc.titleAr,
      titleEn: doc.titleEn,
      subtitleAr: doc.subtitleAr,
      subtitleEn: doc.subtitleEn,
      image: doc.image && typeof doc.image === 'object' ? { url: doc.image.url } : null,
      buttons: (doc.buttons || []).map((btn: any) => ({
        id: btn.id,
        labelAr: btn.labelAr,
        labelEn: btn.labelEn,
        link: btn.link,
        variant: btn.variant,
        color: btn.color,
        openInNewTab: btn.openInNewTab,
      })),
      layout: doc.layout || 'image_right',
      height: doc.height || 'auto',
      backgroundColor: doc.backgroundColor,
      backgroundGradient: doc.backgroundGradient,
      textColor: doc.textColor,
      textAlign: doc.textAlign,
      contentAlign: doc.contentAlign,
      overlayOpacity: doc.overlayOpacity,
      borderRadius: doc.borderRadius,
      autoPlaySpeed: doc.autoPlaySpeed,
      transition: doc.transition,
      group: doc.group,
    }));

    return NextResponse.json({ banners }, { headers: PUBLIC_CACHE_HEADERS });
  } catch (error) {
    console.error('[api/promo-banners]', error);
    return NextResponse.json({ banners: [] }, { status: 500 });
  }
}
