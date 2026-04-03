/**
 * B2B Seat Pool Helpers
 *
 * Provides seat summary calculation and seat transfer logic.
 * Reads from existing `bulk-seat-allocations` + `companies.totalSeats`.
 * Does NOT modify any core booking or allocation logic.
 */

type PayloadClient = {
  find: (args: Record<string, unknown>) => Promise<{
    docs: Array<Record<string, unknown>>;
    totalDocs: number;
    totalPages: number;
  }>;
  findByID: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

type AllocationEntry = {
  user?: unknown;
  allocatedAt?: string | null;
  status?: string | null;
  source?: string | null;
  id?: string | null;
};

type BulkSeatAllocationDoc = {
  id: number | string;
  company?: unknown;
  round?: unknown;
  totalSeats?: number | null;
  openPoolSeats?: number | null;
  allocationMode?: string | null;
  status?: string | null;
  createdByManager?: unknown;
  allocations?: AllocationEntry[] | null;
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
      const parsed = Number(idValue);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

export interface SeatAssignee {
  userId: string;
  name: string;
  email: string;
  status: string;
  source: string;
  allocatedAt: string | null;
}

export interface SeatRoundBreakdown {
  roundId: number;
  roundTitle: string;
  allocationId: number | string;
  allocationMode: string;
  totalSeats: number;
  openPoolSeats: number;
  allocated: number;
  enrolled: number;
  cancelled: number;
  available: number;
  poolClaimed: number;
  poolAvailable: number;
  assignees: SeatAssignee[];
}

export interface CompanySeatSummary {
  totalSeats: number;
  usedSeats: number;
  availableSeats: number;
  byRound: SeatRoundBreakdown[];
}

export async function getCompanySeatSummary(
  payload: PayloadClient,
  companyId: number,
): Promise<CompanySeatSummary> {
  // Get company's totalSeats cap
  const companyDoc = await payload.findByID({
    collection: 'companies',
    id: companyId,
    depth: 0,
    overrideAccess: true,
  });

  const totalSeatsCap =
    typeof (companyDoc as { totalSeats?: unknown }).totalSeats === 'number'
      ? ((companyDoc as { totalSeats: number }).totalSeats)
      : 0;

  // Get all active bulk-seat-allocations for this company
  const allocationsResult = await payload.find({
    collection: 'bulk-seat-allocations',
    where: {
      and: [
        { company: { equals: companyId } },
        { status: { equals: 'active' } },
      ],
    },
    depth: 1,
    limit: 200,
    overrideAccess: true,
  });

  const byRound: SeatRoundBreakdown[] = [];
  let totalUsed = 0;

  // Collect all user IDs to fetch names in batch
  const allUserIds = new Set<number>();
  for (const doc of allocationsResult.docs as unknown as BulkSeatAllocationDoc[]) {
    const entries = Array.isArray(doc.allocations) ? doc.allocations : [];
    for (const e of entries) {
      const uid = resolveId(e.user);
      if (uid) allUserIds.add(uid);
    }
  }

  // Batch fetch user info
  const userMap = new Map<number, { name: string; email: string }>();
  if (allUserIds.size > 0) {
    const userIds = Array.from(allUserIds);
    // Fetch in pages of 100
    for (let i = 0; i < userIds.length; i += 100) {
      const chunk = userIds.slice(i, i + 100);
      const usersResult = await payload.find({
        collection: 'users',
        where: { id: { in: chunk } },
        depth: 0,
        limit: 100,
        overrideAccess: true,
      });

      for (const u of usersResult.docs as Array<Record<string, unknown>>) {
        const uid = resolveId(u.id);
        if (!uid) continue;
        const firstName = typeof u.firstName === 'string' ? u.firstName : '';
        const lastName = typeof u.lastName === 'string' ? u.lastName : '';
        const email = typeof u.email === 'string' ? u.email : '';
        userMap.set(uid, {
          name: `${firstName} ${lastName}`.trim() || email || `User ${uid}`,
          email,
        });
      }
    }
  }

  for (const doc of allocationsResult.docs as unknown as BulkSeatAllocationDoc[]) {
    const roundRelation = doc.round;
    const roundId = resolveId(roundRelation);
    const roundTitle =
      roundRelation && typeof roundRelation === 'object' && 'title' in roundRelation
        ? String((roundRelation as { title?: string }).title || 'Round')
        : 'Round';

    const entries = Array.isArray(doc.allocations) ? doc.allocations : [];
    const activeEntries = entries.filter((e) => e.status !== 'cancelled');
    const allocated = activeEntries.length;
    const enrolled = entries.filter((e) => e.status === 'enrolled').length;
    const cancelled = entries.filter((e) => e.status === 'cancelled').length;
    const totalForRound = typeof doc.totalSeats === 'number' ? doc.totalSeats : 0;
    const openPoolSeats = typeof doc.openPoolSeats === 'number' ? doc.openPoolSeats : 0;
    const allocationMode = doc.allocationMode || 'mixed';

    const poolClaimed = activeEntries.filter((e) => e.source === 'pool_claim').length;
    const maxClaimable = allocationMode === 'open_pool' ? totalForRound : openPoolSeats;
    const poolAvailable = Math.max(0, maxClaimable - poolClaimed);

    totalUsed += allocated;

    // Build assignees list
    const assignees: SeatAssignee[] = activeEntries.map((e) => {
      const uid = resolveId(e.user);
      const info = uid ? userMap.get(uid) : undefined;
      return {
        userId: String(uid || ''),
        name: info?.name || 'Unknown',
        email: info?.email || '',
        status: e.status || 'pending',
        source: e.source || 'assigned',
        allocatedAt: e.allocatedAt || null,
      };
    });

    byRound.push({
      roundId: roundId || 0,
      roundTitle,
      allocationId: doc.id,
      allocationMode,
      totalSeats: totalForRound,
      openPoolSeats,
      allocated,
      enrolled,
      cancelled,
      available: Math.max(0, totalForRound - allocated),
      poolClaimed,
      poolAvailable,
      assignees,
    });
  }

  return {
    totalSeats: totalSeatsCap,
    usedSeats: totalUsed,
    availableSeats: Math.max(0, totalSeatsCap - totalUsed),
    byRound,
  };
}

export interface TransferSeatParams {
  companyId: number;
  fromUserId: number;
  toUserId: number;
  allocationId: number | string;
}

export type TransferResult =
  | { ok: true; allocationId: number | string }
  | { ok: false; error: string; status: number };

export async function transferSeat(
  payload: PayloadClient,
  params: TransferSeatParams,
): Promise<TransferResult> {
  const { companyId, fromUserId, toUserId, allocationId } = params;

  if (fromUserId === toUserId) {
    return { ok: false, error: 'Cannot transfer seat to the same user', status: 400 };
  }

  // Verify both users belong to the company
  const profilesResult = await payload.find({
    collection: 'user-profiles',
    where: {
      and: [
        { user: { in: [fromUserId, toUserId] } },
        { company: { equals: companyId } },
      ],
    },
    depth: 0,
    limit: 2,
    overrideAccess: true,
  });

  const foundUserIds = new Set(
    (profilesResult.docs as Array<{ user?: unknown }>).map((d) => resolveId(d.user)),
  );

  if (!foundUserIds.has(fromUserId)) {
    return { ok: false, error: 'Source user does not belong to this company', status: 403 };
  }
  if (!foundUserIds.has(toUserId)) {
    return { ok: false, error: 'Target user does not belong to this company', status: 403 };
  }

  // Get the allocation record
  const allocDoc = (await payload.findByID({
    collection: 'bulk-seat-allocations',
    id: allocationId,
    depth: 0,
    overrideAccess: true,
  })) as unknown as BulkSeatAllocationDoc;

  if (!allocDoc) {
    return { ok: false, error: 'Allocation record not found', status: 404 };
  }

  const allocCompanyId = resolveId(allocDoc.company);
  if (allocCompanyId !== companyId) {
    return { ok: false, error: 'Allocation does not belong to this company', status: 403 };
  }

  if (allocDoc.status !== 'active') {
    return { ok: false, error: 'Allocation is not active', status: 400 };
  }

  const entries = Array.isArray(allocDoc.allocations) ? [...allocDoc.allocations] : [];

  // Find the source user's active allocation entry
  const sourceIndex = entries.findIndex(
    (e: AllocationEntry) =>
      resolveId(e.user) === fromUserId && e.status !== 'cancelled',
  );

  if (sourceIndex === -1) {
    return { ok: false, error: 'Source user has no active seat in this allocation', status: 400 };
  }

  // Check target doesn't already have one
  const targetExists = entries.some(
    (e: AllocationEntry) =>
      resolveId(e.user) === toUserId && e.status !== 'cancelled',
  );

  if (targetExists) {
    return {
      ok: false,
      error: 'Target user already has a seat in this allocation',
      status: 409,
    };
  }

  // Cancel source, add target (preserve source type)
  const sourceEntry = entries[sourceIndex];
  entries[sourceIndex] = {
    ...sourceEntry,
    status: 'cancelled',
  };

  entries.push({
    user: toUserId as unknown as undefined,
    allocatedAt: new Date().toISOString(),
    status: 'pending',
    source: sourceEntry.source || 'assigned',
  });

  await payload.update({
    collection: 'bulk-seat-allocations',
    id: allocationId,
    data: { allocations: entries },
    overrideAccess: true,
  });

  return { ok: true, allocationId };
}
