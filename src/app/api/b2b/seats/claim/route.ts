import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { authenticateRequestUser } from '@/lib/server-auth';

type AllocationEntry = {
  user?: unknown;
  allocatedAt?: string | null;
  status?: string | null;
  source?: string | null;
  id?: string | null;
};

function resolveId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: unknown }).id;
    if (typeof idValue === 'number') return idValue;
    if (typeof idValue === 'string') {
      const p = Number(idValue);
      return Number.isFinite(p) ? p : null;
    }
  }
  return null;
}

const ACTIVE_BOOKING_STATUSES = ['reserved', 'pending', 'confirmed', 'completed'];

/**
 * POST /api/b2b/seats/claim
 *
 * Company member self-claims an open pool seat.
 * Auth: any authenticated user who belongs to the allocation's company.
 *
 * Body: { allocationId: number }
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const user = await authenticateRequestUser(payload, req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = resolveId(user.id);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user context' }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as {
      allocationId?: unknown;
    } | null;

    const allocationId = resolveId(body?.allocationId);
    if (!allocationId) {
      return NextResponse.json({ error: 'allocationId is required' }, { status: 400 });
    }

    const payloadAny = payload as any;

    // ── Fetch allocation ──────────────────────────────────
    const allocDoc = await payloadAny.findByID({
      collection: 'bulk-seat-allocations',
      id: allocationId,
      depth: 0,
      overrideAccess: true,
    }).catch(() => null);

    if (!allocDoc) {
      return NextResponse.json({ error: 'Allocation not found' }, { status: 404 });
    }

    if (allocDoc.status !== 'active') {
      return NextResponse.json({ error: 'Allocation is not active' }, { status: 400 });
    }

    // ── Verify mode supports pool claims ──────────────────
    const mode = allocDoc.allocationMode || 'assigned';
    if (mode === 'assigned') {
      return NextResponse.json({
        error: 'This allocation does not support self-claiming. Contact your company manager.',
      }, { status: 403 });
    }

    // ── Verify user belongs to the allocation's company ───
    const allocCompanyId = resolveId(allocDoc.company);
    if (!allocCompanyId) {
      return NextResponse.json({ error: 'Invalid allocation company' }, { status: 400 });
    }

    const profileResult = await payloadAny.find({
      collection: 'user-profiles',
      where: {
        and: [
          { user: { equals: userId } },
          { company: { equals: allocCompanyId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    if (profileResult.docs.length === 0) {
      return NextResponse.json({ error: 'You do not belong to this company' }, { status: 403 });
    }

    // ── Check capacity and duplicates ─────────────────────
    const entries = Array.isArray(allocDoc.allocations) ? allocDoc.allocations as AllocationEntry[] : [];

    const alreadyClaimed = entries.some(
      (e) => resolveId(e.user) === userId && e.status !== 'cancelled',
    );
    if (alreadyClaimed) {
      return NextResponse.json({ error: 'You already have a seat in this allocation' }, { status: 409 });
    }

    // Count pool claims
    const poolClaims = entries.filter(
      (e) => e.status !== 'cancelled' && e.source === 'pool_claim',
    ).length;
    const openPoolSeats = typeof allocDoc.openPoolSeats === 'number' ? allocDoc.openPoolSeats : 0;

    // For open_pool mode, all seats are claimable
    const maxClaimable = mode === 'open_pool' ? allocDoc.totalSeats : openPoolSeats;

    if (poolClaims >= maxClaimable) {
      return NextResponse.json({ error: 'No open pool seats remaining' }, { status: 400 });
    }

    // Also check total capacity
    const totalActive = entries.filter((e) => e.status !== 'cancelled').length;
    if (totalActive >= allocDoc.totalSeats) {
      return NextResponse.json({ error: 'No seats remaining' }, { status: 400 });
    }

    // ── Add the claim ─────────────────────────────────────
    const newAllocations = [
      ...entries,
      {
        user: userId,
        allocatedAt: new Date().toISOString(),
        status: 'enrolled' as const,
        source: 'pool_claim' as const,
      },
    ];

    await payloadAny.update({
      collection: 'bulk-seat-allocations',
      id: allocationId,
      data: { allocations: newAllocations },
      overrideAccess: true,
    });

    // ── Auto-create Booking ───────────────────────────────
    const roundId = resolveId(allocDoc.round);
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
            notes: `B2B pool claim from allocation #${allocationId}`,
          },
          overrideAccess: true,
        });
      }
    }

    // ── Notify B2B Manager ────────────────────────────────
    try {
      const userDoc = await payloadAny.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
        overrideAccess: true,
      });
      const memberName = `${userDoc?.firstName || ''} ${userDoc?.lastName || ''}`.trim() || 'Team Member';

      const { notifyMemberBooked } = await import('@/lib/b2b-notifications');
      await notifyMemberBooked(payloadAny, {
        companyId: allocCompanyId,
        memberName,
        programTitle: `Allocation #${allocationId}`,
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      message: 'Seat claimed successfully',
      allocationId: String(allocationId),
    });
  } catch (error) {
    console.error('[api/b2b/seats/claim][POST]', error);
    return NextResponse.json({ error: 'Failed to claim seat' }, { status: 500 });
  }
}
