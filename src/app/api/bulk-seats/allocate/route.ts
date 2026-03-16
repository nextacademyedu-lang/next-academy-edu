import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@payload-config';

/**
 * POST /api/bulk-seats/allocate
 *
 * Allocates a seat from a BulkSeatAllocation to a specific user.
 *
 * Body: { bulkSeatId: number; userId: number }
 *
 * Flow:
 *  1. Validate seat doc exists and is active
 *  2. Check remaining seats > 0
 *  3. Prevent duplicate allocations
 *  4. Append allocation entry
 *  5. Create a Booking for the user → round
 */
export async function POST(req: NextRequest) {
  try {
    const { bulkSeatId, userId } = await req.json();

    if (!bulkSeatId || !userId) {
      return NextResponse.json(
        { success: false, error: 'bulkSeatId and userId are required' },
        { status: 400 },
      );
    }

    const payload = await getPayload({ config: configPromise });

    /* ── 1. Fetch Bulk Seat doc ───────────────────────────── */
    const seatDoc = await payload.findByID({
      collection: 'bulk-seat-allocations',
      id: bulkSeatId,
    });

    if (!seatDoc) {
      return NextResponse.json({ success: false, error: 'Bulk seat record not found' }, { status: 404 });
    }

    if (seatDoc.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Bulk seat allocation is not active' }, { status: 400 });
    }

    /* ── 2. Check capacity ────────────────────────────────── */
    const currentAllocations = (seatDoc.allocations ?? []).filter(
      (a) => a.status !== 'cancelled',
    );
    const remaining = seatDoc.totalSeats - currentAllocations.length;

    if (remaining <= 0) {
      return NextResponse.json({ success: false, error: 'No remaining seats available' }, { status: 400 });
    }

    /* ── 3. Prevent duplicate ──────────────────────────────── */
    const alreadyAllocated = currentAllocations.some(
      (a) => {
        const allocUserId = typeof a.user === 'object' ? a.user.id : a.user;
        return String(allocUserId) === String(userId);
      },
    );
    if (alreadyAllocated) {
      return NextResponse.json({ success: false, error: 'User already has a seat allocated' }, { status: 409 });
    }

    /* ── 4. Append allocation ─────────────────────────────── */
    const newAllocations = [
      ...(seatDoc.allocations ?? []),
      { user: userId, allocatedAt: new Date().toISOString(), status: 'pending' as const },
    ];

    await payload.update({
      collection: 'bulk-seat-allocations',
      id: bulkSeatId,
      data: { allocations: newAllocations },
    });

    /* ── 5. Create Booking for this user → round ──────────── */
    const roundId = typeof seatDoc.round === 'object' ? seatDoc.round.id : seatDoc.round;

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
    });

    return NextResponse.json({
      success: true,
      message: 'Seat allocated successfully',
      remaining: remaining - 1,
    });
  } catch (error) {
    console.error('[bulk-seats/allocate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
