import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

type SessionLike = {
  date?: string | null;
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled' | null;
  isCancelled?: boolean | null;
  attendanceCount?: number | null;
  attendeesCount?: number | null;
};

function normalizeStatus(session: SessionLike): 'scheduled' | 'live' | 'completed' | 'cancelled' {
  if (session.status) return session.status;
  if (session.isCancelled) return 'cancelled';

  const dateValue = session.date ? new Date(session.date).getTime() : null;
  if (dateValue && !Number.isNaN(dateValue) && dateValue < Date.now()) {
    return 'completed';
  }

  return 'scheduled';
}

function normalizeAttendanceCount(session: SessionLike): number {
  if (typeof session.attendanceCount === 'number' && Number.isFinite(session.attendanceCount)) {
    return session.attendanceCount;
  }
  if (typeof session.attendeesCount === 'number' && Number.isFinite(session.attendeesCount)) {
    return session.attendeesCount;
  }
  return 0;
}

function normalizeRelationId(value: unknown): number | string | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value.trim();
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const nested = (value as { id?: unknown }).id;
    if (typeof nested === 'number' && Number.isFinite(nested)) return nested;
    if (typeof nested === 'string' && nested.trim().length > 0) {
      const numeric = Number(nested);
      return Number.isFinite(numeric) ? numeric : nested.trim();
    }
  }
  return null;
}

function parseDateMs(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

async function syncRoundDateRange(params: {
  payload: any;
  roundId: number | string;
  req?: unknown;
}) {
  const { payload, roundId, req } = params;

  const sessionsResult = await payload.find({
    collection: 'sessions',
    where: { round: { equals: roundId } },
    depth: 0,
    sort: 'date',
    limit: 500,
    overrideAccess: true,
    req: req as any,
  });

  const timestamps = (sessionsResult.docs as Array<{ date?: string | null }>)
    .map((doc) => parseDateMs(doc.date))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  if (timestamps.length === 0) return;

  const earliestIso = new Date(timestamps[0]).toISOString();
  const latestIso = new Date(timestamps[timestamps.length - 1]).toISOString();

  const round = await payload.findByID({
    collection: 'rounds',
    id: roundId,
    depth: 0,
    overrideAccess: true,
    req: req as any,
  });

  if (!round) return;

  const roundStartMs = parseDateMs((round as { startDate?: string | null }).startDate);
  const roundEndMs = parseDateMs((round as { endDate?: string | null }).endDate);
  const needsUpdate =
    roundStartMs !== timestamps[0] ||
    roundEndMs !== timestamps[timestamps.length - 1];

  if (!needsUpdate) return;

  await payload.update({
    collection: 'rounds',
    id: roundId,
    data: {
      startDate: earliestIso,
      endDate: latestIso,
    },
    overrideAccess: true,
    req: req as any,
  });
}

export const Sessions: CollectionConfig = {
  slug: 'sessions',
  admin: { useAsTitle: 'title' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const next = { ...(data || {}) } as SessionLike;
        const prev = (originalDoc || {}) as SessionLike;

        if (next.status === 'cancelled') {
          next.isCancelled = true;
        } else if (next.isCancelled === true && !next.status) {
          next.status = 'cancelled';
        }

        const merged = { ...prev, ...next } as SessionLike;
        const status = normalizeStatus(merged);
        next.status = status;

        const attendanceCount = normalizeAttendanceCount(merged);
        next.attendanceCount = attendanceCount;
        next.attendeesCount = attendanceCount;

        return next;
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc }) => {
        const payload = req.payload;
        const affectedRoundIds = new Set<number | string>();

        const currentRoundId = normalizeRelationId((doc as { round?: unknown })?.round);
        if (currentRoundId !== null) affectedRoundIds.add(currentRoundId);

        const previousRoundId = normalizeRelationId((previousDoc as { round?: unknown } | undefined)?.round);
        if (previousRoundId !== null) affectedRoundIds.add(previousRoundId);

        for (const roundId of affectedRoundIds) {
          await syncRoundDateRange({ payload, roundId, req });
        }
      },
    ],
    afterDelete: [
      async ({ req, doc }) => {
        const payload = req.payload;
        const roundId = normalizeRelationId((doc as { round?: unknown } | undefined)?.round);
        if (roundId === null) return;
        await syncRoundDateRange({ payload, roundId, req });
      },
    ],
    afterRead: [
      ({ doc }) => {
        const current = (doc || {}) as SessionLike;
        const status = normalizeStatus(current);
        const attendanceCount = normalizeAttendanceCount(current);

        return {
          ...doc,
          status,
          attendanceCount,
          attendeesCount: attendanceCount,
          isCancelled: status === 'cancelled',
        };
      },
    ],
  },
  fields: [
    { name: 'round', type: 'relationship', relationTo: 'rounds', required: true },
    { name: 'sessionNumber', type: 'number', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'date', type: 'date', required: true },
    { name: 'startTime', type: 'text', required: true },
    { name: 'endTime', type: 'text', required: true },
    {
      name: 'locationType',
      type: 'select',
      options: ['online', 'in-person', 'hybrid'],
      defaultValue: 'online',
    },
    { name: 'locationName', type: 'text' },
    { name: 'locationAddress', type: 'text' },
    { name: 'meetingUrl', type: 'text' },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors' },
    { name: 'recordingUrl', type: 'text' },
    { name: 'materials', type: 'upload', relationTo: 'media', hasMany: true },
    {
      name: 'status',
      type: 'select',
      options: ['scheduled', 'live', 'completed', 'cancelled'],
      defaultValue: 'scheduled',
    },
    { name: 'isCancelled', type: 'checkbox', defaultValue: false },
    { name: 'cancellationReason', type: 'textarea' },
    { name: 'attendanceCount', type: 'number', defaultValue: 0 },
    { name: 'attendeesCount', type: 'number', defaultValue: 0 },
  ],
};
