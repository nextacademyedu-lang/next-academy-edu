import { NextRequest, NextResponse } from 'next/server';
import { resolveB2BScope, relationToId } from '../../_scope.ts';

type AllocationEntry = {
  user?: unknown;
  allocatedAt?: string | null;
  status?: string | null;
  source?: string | null;
  id?: string | null;
};

const ACTIVE_BOOKING_STATUSES = ['reserved', 'pending', 'confirmed', 'completed'];

/**
 * POST /api/b2b/seats/assign
 *
 * B2B Manager assigns a specific employee to a seat.
 *
 * Body: { allocationId: number, userId: number }
 */
export async function POST(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      allocationId?: unknown;
      userId?: unknown;
    } | null;

    const allocationId = relationToId(body?.allocationId);
    const userId = relationToId(body?.userId);

    if (!allocationId || !userId) {
      return NextResponse.json({ error: 'allocationId and userId are required' }, { status: 400 });
    }

    const payloadAny = scope.payload as any;

    // ── Fetch allocation and verify ownership ─────────────
    const allocDoc = await payloadAny.findByID({
      collection: 'bulk-seat-allocations',
      id: allocationId,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null);

    if (!allocDoc) {
      return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
    }

    const allocCompanyId = relationToId(allocDoc.company);
    if (allocCompanyId !== scope.companyId) {
      return NextResponse.json({ error: 'Allocation does not belong to your company' }, { status: 403 });
    }

    if (allocDoc.status !== 'active') {
      return NextResponse.json({ error: 'Allocation is not active' }, { status: 400 });
    }

    // ── Verify user belongs to company ────────────────────
    const profileResult = await payloadAny.find({
      collection: 'user-profiles',
      where: {
        and: [
          { user: { equals: userId } },
          { company: { equals: scope.companyId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    if (profileResult.docs.length === 0) {
      return NextResponse.json({ error: 'User does not belong to your company' }, { status: 400 });
    }

    // ── Check for duplicate + capacity ────────────────────
    const entries = Array.isArray(allocDoc.allocations) ? allocDoc.allocations as AllocationEntry[] : [];

    const alreadyAssigned = entries.some(
      (e) => relationToId(e.user) === userId && e.status !== 'cancelled',
    );
    if (alreadyAssigned) {
      return NextResponse.json({ error: 'User already has a seat in this allocation' }, { status: 409 });
    }

    const activeCount = entries.filter((e) => e.status !== 'cancelled').length;
    if (activeCount >= allocDoc.totalSeats) {
      return NextResponse.json({ error: 'No seats remaining' }, { status: 400 });
    }

    // For mixed/assigned mode, check assigned capacity (totalSeats - openPoolSeats)
    const openPoolSeats = typeof allocDoc.openPoolSeats === 'number' ? allocDoc.openPoolSeats : 0;
    const assignedEntries = entries.filter(
      (e) => e.status !== 'cancelled' && e.source !== 'pool_claim',
    ).length;
    const maxAssigned = allocDoc.totalSeats - openPoolSeats;

    if (assignedEntries >= maxAssigned && allocDoc.allocationMode !== 'open_pool') {
      return NextResponse.json({
        error: `All assigned seats are taken (${maxAssigned}). Remaining ${openPoolSeats} are reserved for pool claims.`,
      }, { status: 400 });
    }

    // ── Add the seat ──────────────────────────────────────
    const newAllocations = [
      ...entries,
      {
        user: userId,
        allocatedAt: new Date().toISOString(),
        status: 'enrolled' as const,
        source: 'assigned' as const,
      },
    ];

    await payloadAny.update({
      collection: 'bulk-seat-allocations',
      id: allocationId,
      data: { allocations: newAllocations },
      overrideAccess: true,
    });

    // ── Auto-create Booking ───────────────────────────────
    const roundId = relationToId(allocDoc.round);
    if (roundId) {
      const existingBooking = await payloadAny.find({
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
      });

      if (existingBooking.docs.length === 0) {
        await payloadAny.create({
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
            notes: `B2B seat assignment from allocation #${allocationId}`,
          },
          overrideAccess: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seat assigned successfully',
      remaining: allocDoc.totalSeats - (activeCount + 1),
    });
  } catch (error) {
    console.error('[api/b2b/seats/assign][POST]', error);
    return NextResponse.json({ error: 'Failed to assign seat' }, { status: 500 });
  }
}

/**
 * DELETE /api/b2b/seats/assign
 *
 * B2B Manager unassigns/cancels a seat assignment.
 *
 * Body: { allocationId: number, userId: number }
 */
export async function DELETE(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      allocationId?: unknown;
      userId?: unknown;
    } | null;

    const allocationId = relationToId(body?.allocationId);
    const userId = relationToId(body?.userId);

    if (!allocationId || !userId) {
      return NextResponse.json({ error: 'allocationId and userId are required' }, { status: 400 });
    }

    const payloadAny = scope.payload as any;

    // ── Fetch allocation and verify ───────────────────────
    const allocDoc = await payloadAny.findByID({
      collection: 'bulk-seat-allocations',
      id: allocationId,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null);

    if (!allocDoc) {
      return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
    }

    const allocCompanyId = relationToId(allocDoc.company);
    if (allocCompanyId !== scope.companyId) {
      return NextResponse.json({ error: 'Allocation does not belong to your company' }, { status: 403 });
    }

    const entries = Array.isArray(allocDoc.allocations) ? [...allocDoc.allocations] as AllocationEntry[] : [];

    // ── Find and cancel the entry ─────────────────────────
    const targetIndex = entries.findIndex(
      (e) => relationToId(e.user) === userId && e.status !== 'cancelled',
    );

    if (targetIndex === -1) {
      return NextResponse.json({ error: 'User has no active seat in this allocation' }, { status: 404 });
    }

    entries[targetIndex] = {
      ...entries[targetIndex],
      status: 'cancelled',
    };

    await payloadAny.update({
      collection: 'bulk-seat-allocations',
      id: allocationId,
      data: { allocations: entries },
      overrideAccess: true,
    });

    // ── Cancel the Booking too (if it was auto-created) ───
    const roundId = relationToId(allocDoc.round);
    if (roundId) {
      const bookingResult = await payloadAny.find({
        collection: 'bookings',
        where: {
          and: [
            { user: { equals: userId } },
            { round: { equals: roundId } },
            { status: { in: ACTIVE_BOOKING_STATUSES } },
            { bookingSource: { equals: 'admin' } },
          ],
        },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      });

      if (bookingResult.docs.length > 0) {
        const booking = bookingResult.docs[0] as { id: number | string };
        await payloadAny.update({
          collection: 'bookings',
          id: booking.id,
          data: {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancellationReason: 'B2B seat unassigned by manager',
          },
          overrideAccess: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Seat unassigned successfully',
    });
  } catch (error) {
    console.error('[api/b2b/seats/assign][DELETE]', error);
    return NextResponse.json({ error: 'Failed to unassign seat' }, { status: 500 });
  }
}
