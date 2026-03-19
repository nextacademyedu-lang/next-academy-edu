import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

/**
 * GET /api/popups/active?page=/ar/programs
 * Returns active popups matching the given page URL.
 */
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page') || '/';
    const payload = await getPayload({ config });
    const now = new Date().toISOString();

    const result = await payload.find({
      collection: 'popups',
      where: {
        and: [
          { status: { equals: 'active' } },
          {
            or: [
              { startDate: { exists: false } },
              { startDate: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endDate: { exists: false } },
              { endDate: { greater_than_equal: now } },
            ],
          },
        ],
      },
      sort: '-priority',
      depth: 1,
      limit: 10,
    });

    // Filter by page targeting
    const popups = result.docs.filter((popup) => {
      const targeting = popup.targeting as {
        displayPages?: string;
        specificPages?: Array<{ url: string }>;
      } | undefined;

      if (!targeting || targeting.displayPages !== 'specific') return true;

      const pages = targeting.specificPages || [];
      return pages.some(
        (p) => page === p.url || page.startsWith(p.url),
      );
    });

    return NextResponse.json({ popups });
  } catch (error) {
    console.error('[api/popups/active]', error);
    return NextResponse.json(
      { error: 'Failed to fetch popups' },
      { status: 500 },
    );
  }
}
