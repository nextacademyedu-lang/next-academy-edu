import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

type AuthUser = {
  id?: number | string;
  role?: string | null;
};

function relationToId(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: unknown }).id;
    if (typeof idValue === 'number') return idValue;
    if (typeof idValue === 'string') {
      const parsed = Number(idValue);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

async function getCompanyIdFromUserProfile(params: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  userId: number;
  req: NextRequest;
}) {
  const { payload, userId, req } = params;
  const profileResult = await payload.find({
    collection: 'user-profiles',
    where: { user: { equals: userId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  });

  const profile = profileResult.docs[0] as { company?: unknown } | undefined;
  return relationToId(profile?.company);
}

const ACTIVE_BOOKING_STATUSES = ['reserved', 'pending', 'confirmed', 'completed'];

/**
 * POST /api/bulk-seats/allocate
 *
 * Auth: admin or b2b_manager
 * Body: { bulkSeatId: number; userId: number }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      bulkSeatId?: unknown;
      userId?: unknown;
    } | null;

    const bulkSeatId = relationToId(body?.bulkSeatId);
    const userId = relationToId(body?.userId);

    if (!bulkSeatId || !userId) {
      return NextResponse.json(
        { success: false, error: 'bulkSeatId and userId are required' },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });
    const { user } = await payload.auth({ headers: req.headers });
    const authUser = (user || null) as AuthUser | null;

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const role = authUser.role || 'user';
    if (role !== 'admin' && role !== 'b2b_manager') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const actorId = relationToId(authUser.id);
    if (!actorId) {
      return NextResponse.json(
        { success: false, error: 'Invalid actor context' },
        { status: 403 },
      );
    }

    const seatDoc = await payload.findByID({
      collection: 'bulk-seat-allocations',
      id: bulkSeatId,
      depth: 1,
      overrideAccess: true,
      req,
    }).catch(() => null);

    if (!seatDoc) {
      return NextResponse.json(
        { success: false, error: 'Bulk seat record not found' },
        { status: 404 },
      );
    }

    if (seatDoc.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Bulk seat allocation is not active' },
        { status: 400 },
      );
    }

    const seatCompanyId = relationToId((seatDoc as { company?: unknown }).company);
    if (!seatCompanyId) {
      return NextResponse.json(
        { success: false, error: 'Bulk seat allocation has no valid company scope' },
        { status: 400 },
      );
    }

    const targetUserCompanyId = await getCompanyIdFromUserProfile({
      payload,
      userId,
      req,
    });

    if (!targetUserCompanyId || targetUserCompanyId !== seatCompanyId) {
      return NextResponse.json(
        { success: false, error: 'Target user is not linked to this company' },
        { status: 400 },
      );
    }

    if (role === 'b2b_manager') {
      const actorCompanyId = await getCompanyIdFromUserProfile({
        payload,
        userId: actorId,
        req,
      });

      if (!actorCompanyId || actorCompanyId !== seatCompanyId) {
        return NextResponse.json(
          { success: false, error: 'You cannot allocate seats outside your company scope' },
          { status: 403 },
        );
      }
    }

    const currentAllocations = (seatDoc.allocations ?? []).filter(
      (entry: { status?: string } | null | undefined) => entry?.status !== 'cancelled',
    );

    const alreadyAllocated = currentAllocations.some((entry) => {
      const allocUserId = relationToId(entry?.user);
      return allocUserId === userId;
    });

    if (alreadyAllocated) {
      return NextResponse.json(
        { success: false, error: 'User already has a seat allocated' },
        { status: 409 },
      );
    }

    const remaining = seatDoc.totalSeats - currentAllocations.length;
    if (remaining <= 0) {
      return NextResponse.json(
        { success: false, error: 'No remaining seats available' },
        { status: 400 },
      );
    }

    const newAllocations = [
      ...(seatDoc.allocations ?? []),
      {
        user: userId,
        allocatedAt: new Date().toISOString(),
        status: 'enrolled' as const,
      },
    ];

    await payload.update({
      collection: 'bulk-seat-allocations',
      id: bulkSeatId,
      data: { allocations: newAllocations },
      overrideAccess: true,
      req,
    });

    const roundId = relationToId((seatDoc as { round?: unknown }).round);
    if (!roundId) {
      return NextResponse.json(
        { success: false, error: 'Bulk seat allocation has no valid round' },
        { status: 400 },
      );
    }

    const existingBooking = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { user: { equals: userId } },
          { round: { equals: roundId } },
          { status: { in: ACTIVE_BOOKING_STATUSES } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    });

    if (existingBooking.docs.length === 0) {
      await payload.create({
        collection: 'bookings',
        data: {
          user: userId,
          round: roundId,
          status: 'confirmed',
          totalAmount: 0,
          paidAmount: 0,
          remainingAmount: 0,
          finalAmount: 0,
          bookingSource: 'admin',
          notes: `Auto-created from bulk seat allocation ${bulkSeatId}`,
        },
        overrideAccess: true,
        req,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Seat allocated successfully',
      remaining: remaining - 1,
    });
  } catch (error) {
    console.error('[api/bulk-seats/allocate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

