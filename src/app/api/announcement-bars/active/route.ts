import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

function isAdminViewer(user: { role?: unknown; email?: unknown } | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const configured = (process.env.PAYLOAD_ADMIN_EMAIL || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  return Boolean(userEmail && configured.includes(userEmail));
}

/**
 * GET /api/announcement-bars/active?page=/ar
 * Returns the highest-priority active announcement bar for the given page.
 */
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page') || '/';
    const previewAnnouncementId = req.nextUrl.searchParams.get('previewAnnouncementId');
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });

    if (previewAnnouncementId) {
      if (!isAdminViewer(user)) {
        return NextResponse.json({ error: 'Unauthorized preview access' }, { status: 403 });
      }

      let bar: unknown = null;
      try {
        bar = await payload.findByID({
          collection: 'announcement-bars',
          id: previewAnnouncementId,
          depth: 0,
          overrideAccess: true,
        });
      } catch {
        bar = null;
      }

      return NextResponse.json({ bar });
    }

    const now = new Date().toISOString();

    const result = await payload.find({
      collection: 'announcement-bars',
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
      depth: 0,
      limit: 5,
    });

    // Filter by page targeting
    const bars = result.docs.filter((bar) => {
      const targeting = bar.targeting as {
        displayPages?: string;
        specificPages?: Array<{ url: string }>;
      } | undefined;

      if (!targeting || targeting.displayPages !== 'specific') return true;

      const pages = targeting.specificPages || [];
      return pages.some(
        (p) => page === p.url || page.startsWith(p.url),
      );
    });

    // Return only the top-priority bar
    const bar = bars[0] || null;

    return NextResponse.json({ bar });
  } catch (error) {
    console.error('[api/announcement-bars/active]', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement bar' },
      { status: 500 },
    );
  }
}
