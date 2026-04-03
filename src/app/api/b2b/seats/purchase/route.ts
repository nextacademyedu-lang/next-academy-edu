import { NextRequest, NextResponse } from 'next/server';
import { resolveB2BScope, relationToId } from '../../_scope.ts';

const ACTIVE_BOOKING_STATUSES = ['reserved', 'pending', 'confirmed', 'completed'];

/**
 * POST /api/b2b/seats/purchase
 *
 * B2B Manager purchases bulk seats for a round.
 *
 * Body: {
 *   roundId: number,
 *   totalSeats: number,
 *   allocationMode?: 'assigned' | 'open_pool' | 'mixed',
 *   openPoolSeats?: number,
 *   assignees?: number[],
 *   notes?: string,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      roundId?: unknown;
      totalSeats?: unknown;
      allocationMode?: unknown;
      openPoolSeats?: unknown;
      assignees?: unknown;
      notes?: unknown;
    } | null;

    // ── Validate required fields ──────────────────────────
    const roundId = relationToId(body?.roundId);
    if (!roundId) {
      return NextResponse.json({ error: 'roundId is required' }, { status: 400 });
    }

    const totalSeats = typeof body?.totalSeats === 'number' && body.totalSeats > 0
      ? Math.floor(body.totalSeats)
      : null;
    if (!totalSeats) {
      return NextResponse.json({ error: 'totalSeats must be a positive integer' }, { status: 400 });
    }

    const allocationMode =
      body?.allocationMode === 'assigned' || body?.allocationMode === 'open_pool' || body?.allocationMode === 'mixed'
        ? body.allocationMode
        : 'mixed';

    const openPoolSeats = typeof body?.openPoolSeats === 'number' && body.openPoolSeats >= 0
      ? Math.min(Math.floor(body.openPoolSeats), totalSeats)
      : allocationMode === 'open_pool' ? totalSeats : 0;

    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';

    // ── Validate round exists and is bookable ──────────────
    const payloadAny = scope.payload as any;
    const round = await payloadAny.findByID({
      collection: 'rounds',
      id: roundId,
      depth: 1,
      overrideAccess: true,
    });

    if (!round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    }

    const roundStatus = round.status || 'draft';
    if (!['open', 'upcoming'].includes(roundStatus)) {
      return NextResponse.json({ error: 'Round is not available for booking' }, { status: 400 });
    }

    const remainingCapacity = (round.maxCapacity || 0) - (round.currentEnrollments || 0);
    if (totalSeats > remainingCapacity) {
      return NextResponse.json({
        error: `Not enough capacity. Available: ${remainingCapacity}, Requested: ${totalSeats}`,
      }, { status: 400 });
    }

    // ── Validate assignees belong to company ───────────────
    const rawAssignees = Array.isArray(body?.assignees) ? body.assignees : [];
    const assigneeIds: number[] = [];

    for (const raw of rawAssignees) {
      const id = relationToId(raw);
      if (id) assigneeIds.push(id);
    }

    const assignedCount = allocationMode === 'open_pool' ? 0 : assigneeIds.length;
    if (assignedCount > totalSeats - openPoolSeats) {
      return NextResponse.json({
        error: `Too many assignees. Max assigned seats: ${totalSeats - openPoolSeats}`,
      }, { status: 400 });
    }

    // Verify assignees belong to this company
    if (assigneeIds.length > 0) {
      const profilesResult = await payloadAny.find({
        collection: 'user-profiles',
        where: {
          and: [
            { user: { in: assigneeIds } },
            { company: { equals: scope.companyId } },
          ],
        },
        depth: 0,
        limit: assigneeIds.length + 10,
        overrideAccess: true,
      });

      const foundUserIds = new Set(
        (profilesResult.docs as Array<{ user?: unknown }>).map((d) => relationToId(d.user)),
      );

      const invalid = assigneeIds.filter((id) => !foundUserIds.has(id));
      if (invalid.length > 0) {
        return NextResponse.json({
          error: `Users not in your company: ${invalid.join(', ')}`,
        }, { status: 400 });
      }
    }

    // ── Check for existing active allocation for same round ─
    const existingAlloc = await payloadAny.find({
      collection: 'bulk-seat-allocations',
      where: {
        and: [
          { company: { equals: scope.companyId } },
          { round: { equals: roundId } },
          { status: { equals: 'active' } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    if (existingAlloc.docs.length > 0) {
      return NextResponse.json({
        error: 'An active seat allocation already exists for this round. Use the assign endpoint to add members.',
        existingAllocationId: String(existingAlloc.docs[0].id),
      }, { status: 409 });
    }

    // ── Build allocation entries ───────────────────────────
    const allocations = assigneeIds.map((userId) => ({
      user: userId,
      allocatedAt: new Date().toISOString(),
      status: 'enrolled' as const,
      source: 'assigned' as const,
    }));

    // ── Create BulkSeatAllocation ──────────────────────────
    const allocationDoc = await payloadAny.create({
      collection: 'bulk-seat-allocations',
      data: {
        company: scope.companyId,
        round: roundId,
        totalSeats,
        openPoolSeats,
        allocationMode,
        status: 'active',
        createdByManager: relationToId(scope.user.id),
        purchaseDate: new Date().toISOString(),
        allocations,
        ...(notes ? { notes } : {}),
      },
      overrideAccess: true,
    });

    // ── Auto-create Bookings for pre-assigned users ────────
    for (const userId of assigneeIds) {
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
            notes: `B2B seat allocation #${allocationDoc.id}`,
          },
          overrideAccess: true,
        });
      }
    }

    // ── Get program title for response ─────────────────────
    const program = typeof round.program === 'object' ? round.program : null;
    const programTitle = program?.titleEn || program?.titleAr || 'Program';

    return NextResponse.json({
      success: true,
      allocation: {
        id: String(allocationDoc.id),
        company: { id: String(scope.companyId), name: scope.company.name },
        round: { id: String(roundId), title: round.title || `Round ${round.roundNumber}` },
        programTitle,
        totalSeats,
        openPoolSeats,
        allocationMode,
        assignedCount: assigneeIds.length,
        availableSeats: totalSeats - assigneeIds.length,
      },
    });
  } catch (error) {
    console.error('[api/b2b/seats/purchase][POST]', error);
    return NextResponse.json({ error: 'Failed to purchase seats' }, { status: 500 });
  }
}
