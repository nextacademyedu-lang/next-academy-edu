import { NextRequest, NextResponse } from 'next/server';
import { resolveB2BScope, parsePagination } from '../_scope.ts';

const B2B_NOTIFICATION_TYPES = [
  'b2b_member_booked',
  'b2b_member_cancelled',
  'b2b_invitation_accepted',
  'b2b_seats_low',
  'b2b_budget_threshold',
  'b2b_member_joined',
  'b2b_member_removed',
];

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, user } = scope;
    const { page, limit } = parsePagination(req, 20, 50);

    const result = await payload.find({
      collection: 'notifications',
      where: {
        and: [
          { user: { equals: user.id } },
          { type: { in: B2B_NOTIFICATION_TYPES } },
        ],
      },
      sort: '-createdAt',
      depth: 0,
      limit,
      page,
      overrideAccess: true,
    });

    const docs = (
      result.docs as Array<{
        id: number | string;
        type?: string;
        title?: string;
        message?: string;
        actionUrl?: string;
        isRead?: boolean;
        createdAt?: string;
      }>
    ).map((n) => ({
      id: String(n.id),
      type: n.type || '',
      title: n.title || '',
      message: n.message || '',
      actionUrl: n.actionUrl || '',
      isRead: n.isRead || false,
      createdAt: n.createdAt || '',
    }));

    return NextResponse.json({
      docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[api/b2b/notifications][GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B notifications' },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      notificationId?: unknown;
      markAllRead?: boolean;
    } | null;

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { payload, user } = scope;

    if (body.markAllRead) {
      // Mark all B2B notifications as read for this user
      const unread = await payload.find({
        collection: 'notifications',
        where: {
          and: [
            { user: { equals: user.id } },
            { type: { in: B2B_NOTIFICATION_TYPES } },
            { isRead: { equals: false } },
          ],
        },
        depth: 0,
        limit: 200,
        overrideAccess: true,
      });

      for (const doc of unread.docs as Array<{ id: number | string }>) {
        await payload.update({
          collection: 'notifications',
          id: doc.id,
          data: { isRead: true, readAt: new Date().toISOString() },
          overrideAccess: true,
          req,
        });
      }

      return NextResponse.json({ markedRead: unread.docs.length });
    }

    // Mark single notification read
    const notifId = body.notificationId;
    if (notifId) {
      await payload.update({
        collection: 'notifications',
        id: notifId as number,
        data: { isRead: true, readAt: new Date().toISOString() },
        overrideAccess: true,
        req,
      });
      return NextResponse.json({ markedRead: 1 });
    }

    return NextResponse.json({ error: 'notificationId or markAllRead required' }, { status: 400 });
  } catch (error) {
    console.error('[api/b2b/notifications][PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 },
    );
  }
}
