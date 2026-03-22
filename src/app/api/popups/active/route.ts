import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { authenticateRequestUser } from '@/lib/server-auth';

const PURCHASED_BOOKING_STATUSES = ['confirmed', 'completed'];

type PopupTargeting = {
  displayPages?: 'all' | 'specific' | null;
  specificPages?: Array<{ url?: string | null }> | null;
  targetAudience?: 'all' | 'guests_only' | 'logged_in' | 'specific_role' | null;
  targetRole?: 'student' | 'user' | 'instructor' | 'b2b_manager' | null;
  visitorCondition?: 'all' | 'first_visit' | 'returning_visitor' | null;
  purchaseCondition?: 'all' | 'no_purchase' | 'has_purchase' | null;
  emailCaptureCondition?: 'all' | 'email_captured' | 'email_not_captured' | null;
  minSessionPageViews?: number | null;
};

type ViewerContext = {
  isLoggedIn: boolean;
  role?: string;
  hasPurchase: boolean;
  firstVisit: boolean;
  emailCaptured: boolean;
  sessionPageViews: number;
};

function parseBooleanParam(value: string | null): boolean {
  return value === '1' || value === 'true';
}

function normalizeRole(role?: string): string | undefined {
  if (!role) return undefined;
  if (role === 'student') return 'user';
  return role;
}

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

function matchesPageTargeting(page: string, targeting?: PopupTargeting): boolean {
  if (!targeting || targeting.displayPages !== 'specific') return true;
  if (!targeting.specificPages?.length) return false;

  return targeting.specificPages.some((entry) => {
    const url = entry?.url?.trim();
    if (!url) return false;
    return page === url || page.startsWith(url);
  });
}

function matchesAudienceTargeting(targeting: PopupTargeting | undefined, viewer: ViewerContext): boolean {
  const targetAudience = targeting?.targetAudience || 'all';

  if (targetAudience === 'guests_only' && viewer.isLoggedIn) return false;
  if (targetAudience === 'logged_in' && !viewer.isLoggedIn) return false;

  if (targetAudience === 'specific_role') {
    const targetRole = normalizeRole(targeting?.targetRole || undefined);
    const viewerRole = normalizeRole(viewer.role);
    if (!targetRole || !viewerRole || targetRole !== viewerRole) return false;
  }

  return true;
}

function matchesBehaviorTargeting(targeting: PopupTargeting | undefined, viewer: ViewerContext): boolean {
  const visitorCondition = targeting?.visitorCondition || 'all';
  const purchaseCondition = targeting?.purchaseCondition || 'all';
  const emailCaptureCondition = targeting?.emailCaptureCondition || 'all';
  const minSessionPageViews = Number(targeting?.minSessionPageViews || 0);

  if (visitorCondition === 'first_visit' && !viewer.firstVisit) return false;
  if (visitorCondition === 'returning_visitor' && viewer.firstVisit) return false;

  if (purchaseCondition === 'no_purchase' && viewer.hasPurchase) return false;
  if (purchaseCondition === 'has_purchase' && !viewer.hasPurchase) return false;

  if (emailCaptureCondition === 'email_captured' && !viewer.emailCaptured) return false;
  if (emailCaptureCondition === 'email_not_captured' && viewer.emailCaptured) return false;

  if (minSessionPageViews > 0 && viewer.sessionPageViews < minSessionPageViews) return false;

  return true;
}

/**
 * GET /api/popups/active?page=/ar/programs
 * Returns active popups matching the given page URL.
 */
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page') || '/';
    const previewPopupId = req.nextUrl.searchParams.get('previewPopupId');
    const firstVisit = parseBooleanParam(req.nextUrl.searchParams.get('firstVisit'));
    const emailCaptured = parseBooleanParam(req.nextUrl.searchParams.get('emailCaptured'));
    const sessionPageViews = Number.parseInt(req.nextUrl.searchParams.get('sessionPageViews') || '1', 10);

    const payload = await getPayload({ config });
    const user = await authenticateRequestUser(payload, req);

    if (previewPopupId) {
      if (!isAdminViewer(user)) {
        return NextResponse.json({ error: 'Unauthorized preview access' }, { status: 403 });
      }

      let popup: unknown = null;
      try {
        popup = await payload.findByID({
          collection: 'popups',
          id: previewPopupId,
          depth: 1,
          overrideAccess: true,
        });
      } catch {
        popup = null;
      }

      return NextResponse.json({ popups: popup ? [popup] : [] });
    }

    const now = new Date().toISOString();

    let hasPurchase = false;
    if (user?.id) {
      const bookings = await payload.find({
        collection: 'bookings',
        where: {
          and: [
            { user: { equals: user.id } },
            { status: { in: PURCHASED_BOOKING_STATUSES } },
          ],
        },
        depth: 0,
        limit: 1,
      });
      hasPurchase = bookings.totalDocs > 0;
    }

    const viewer: ViewerContext = {
      isLoggedIn: Boolean(user),
      role: user?.role,
      hasPurchase,
      firstVisit,
      emailCaptured,
      sessionPageViews: Number.isFinite(sessionPageViews) ? sessionPageViews : 1,
    };

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

    // Apply full targeting filters (page + audience + behavior)
    const popups = result.docs.filter((popup) => {
      const targeting = popup.targeting as PopupTargeting | undefined;
      return (
        matchesPageTargeting(page, targeting) &&
        matchesAudienceTargeting(targeting, viewer) &&
        matchesBehaviorTargeting(targeting, viewer)
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
