import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

type SessionPlanInput = {
  title?: string | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  locationType?: 'online' | 'in-person' | 'hybrid' | null;
  locationName?: string | null;
  locationAddress?: string | null;
  meetingUrl?: string | null;
};

type RoundLike = {
  id?: number | string;
  roundNumber?: number | null;
  title?: string | null;
  locationType?: 'online' | 'in-person' | 'hybrid' | null;
  locationName?: string | null;
  locationAddress?: string | null;
  meetingUrl?: string | null;
  sessionPlan?: SessionPlanInput[] | null;
};

function normalizeSessionPlan(value: unknown): SessionPlanInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const record = entry as Record<string, unknown>;
      const date = typeof record.date === 'string' && record.date.trim().length > 0 ? record.date : null;
      if (!date) return null;

      const title = typeof record.title === 'string' ? record.title.trim() : '';
      const startTime = typeof record.startTime === 'string' && record.startTime.trim().length > 0
        ? record.startTime.trim()
        : '10:00';
      const endTime = typeof record.endTime === 'string' && record.endTime.trim().length > 0
        ? record.endTime.trim()
        : '12:00';
      const locationType =
        record.locationType === 'online' || record.locationType === 'in-person' || record.locationType === 'hybrid'
          ? record.locationType
          : null;
      const locationName = typeof record.locationName === 'string' ? record.locationName.trim() : '';
      const locationAddress = typeof record.locationAddress === 'string' ? record.locationAddress.trim() : '';
      const meetingUrl = typeof record.meetingUrl === 'string' ? record.meetingUrl.trim() : '';

      return {
        title: title || null,
        date,
        startTime,
        endTime,
        locationType,
        locationName: locationName || null,
        locationAddress: locationAddress || null,
        meetingUrl: meetingUrl || null,
      } as SessionPlanInput;
    })
    .filter((entry): entry is SessionPlanInput => entry !== null);
}

function getDateRangeFromPlan(sessionPlan: SessionPlanInput[]): { startDate: string; endDate: string } | null {
  if (sessionPlan.length === 0) return null;
  const timestamps = sessionPlan
    .map((entry) => (entry.date ? new Date(entry.date).getTime() : Number.NaN))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (timestamps.length === 0) return null;

  return {
    startDate: new Date(timestamps[0]).toISOString(),
    endDate: new Date(timestamps[timestamps.length - 1]).toISOString(),
  };
}

async function syncSessionsFromRoundPlan(params: { payload: any; req: unknown; round: RoundLike }) {
  const { payload, req, round } = params;
  if (!round.id) return;

  const sessionPlan = normalizeSessionPlan(round.sessionPlan);
  if (sessionPlan.length === 0) return;

  const existingSessions = await payload.find({
    collection: 'sessions',
    where: { round: { equals: round.id } },
    depth: 0,
    sort: 'sessionNumber',
    limit: 500,
    overrideAccess: true,
    req: req as any,
  });

  const existingByNumber = new Map<number, any>();
  for (const session of existingSessions.docs as Array<{ id: number | string; sessionNumber?: number | null; title?: string | null }>) {
    if (typeof session.sessionNumber === 'number' && Number.isFinite(session.sessionNumber)) {
      existingByNumber.set(session.sessionNumber, session);
    }
  }

  for (let index = 0; index < sessionPlan.length; index += 1) {
    const sessionNumber = index + 1;
    const plan = sessionPlan[index];
    if (!plan.date) continue;

    const existing = existingByNumber.get(sessionNumber);
    const fallbackRoundLabel =
      typeof round.roundNumber === 'number' && Number.isFinite(round.roundNumber)
        ? `Round ${round.roundNumber}`
        : 'Round';
    const normalizedTitle =
      (plan.title && plan.title.trim()) ||
      (typeof existing?.title === 'string' && existing.title.trim()) ||
      round.title ||
      `${fallbackRoundLabel} - Session ${sessionNumber}`;

    const nextSessionData = {
      round: round.id,
      sessionNumber,
      title: normalizedTitle,
      date: plan.date,
      startTime: plan.startTime || '10:00',
      endTime: plan.endTime || '12:00',
      locationType: plan.locationType || round.locationType || 'online',
      locationName: plan.locationName || round.locationName || null,
      locationAddress: plan.locationAddress || round.locationAddress || null,
      meetingUrl: plan.meetingUrl || round.meetingUrl || null,
    };

    if (existing) {
      await payload.update({
        collection: 'sessions',
        id: existing.id,
        data: nextSessionData,
        overrideAccess: true,
        req: req as any,
      });
      continue;
    }

    await payload.create({
      collection: 'sessions',
      data: {
        ...nextSessionData,
        status: 'scheduled',
      },
      overrideAccess: true,
      req: req as any,
    });
  }
}

export const Rounds: CollectionConfig = {
  slug: 'rounds',
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
        const next = { ...(data || {}) } as RoundLike & Record<string, unknown>;

        // Only auto-sync dates when sessionPlan was explicitly changed by the user.
        // If the user is editing other fields (e.g. endDate manually), preserve their value.
        const incomingPlan = next.sessionPlan;
        const originalPlan = (originalDoc as RoundLike | undefined)?.sessionPlan;

        const planChanged =
          incomingPlan !== undefined &&
          JSON.stringify(incomingPlan) !== JSON.stringify(originalPlan);

        if (!planChanged) return next;

        const currentPlan = normalizeSessionPlan(incomingPlan);
        const dateRange = getDateRangeFromPlan(currentPlan);
        if (!dateRange) return next;

        next.startDate = dateRange.startDate;
        next.endDate = dateRange.endDate;
        return next;
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Helper to bulk-delete a collection filtered by round
        const deleteByRound = async (collection: string) => {
          const found = await req.payload.find({
            collection: collection as any,
            where: { round: { equals: id } },
            depth: 0,
            limit: 1000,
            overrideAccess: true,
            req,
          });
          for (const doc of found.docs) {
            await req.payload.delete({
              collection: collection as any,
              id: (doc as { id: number | string }).id,
              overrideAccess: true,
              req,
            });
          }
        };

        // Delete children that reference this round (order matters for nested FKs)
        await deleteByRound('sessions');
        await deleteByRound('waitlist');
        await deleteByRound('payment-plans');
        await deleteByRound('payment-links');
        await deleteByRound('installment-requests');
        await deleteByRound('reviews');
        await deleteByRound('bookings');
      },
    ],

    afterChange: [
      async ({ req, doc, previousDoc }) => {
        try {
          // Only sync sessions when the sessionPlan was actually modified
          const prevPlan = (previousDoc as RoundLike | undefined)?.sessionPlan;
          const nextPlan = (doc as RoundLike)?.sessionPlan;
          if (JSON.stringify(prevPlan) === JSON.stringify(nextPlan)) return;

          await syncSessionsFromRoundPlan({
            payload: req.payload,
            req,
            round: doc as RoundLike,
          });
        } catch (err) {
          console.error('[Rounds] afterChange session sync failed (non-blocking):', err);
        }
      },
    ],
  },

  fields: [
    { name: 'program', type: 'relationship', relationTo: 'programs', required: true },
    {
      name: 'roundNumber',
      type: 'number',
      required: true,
      admin: {
        description: 'Round index inside the same program (1, 2, 3...). Create a separate Round record for each round.',
      },
    },
    { name: 'title', type: 'text' },
    {
      name: 'sessionPlan',
      label: 'Quick Session Planner',
      type: 'array',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'date', type: 'date' },
        { name: 'startTime', type: 'text', required: true, defaultValue: '10:00' },
        { name: 'endTime', type: 'text', required: true, defaultValue: '12:00' },
        {
          name: 'locationType',
          type: 'select',
          options: ['online', 'in-person', 'hybrid'],
        },
        { name: 'locationName', type: 'text' },
        { name: 'locationAddress', type: 'text' },
        { name: 'meetingUrl', type: 'text' },
      ],
      admin: {
        description:
          'Add one row per session to auto-create/update docs in the Sessions collection. You can still edit full session details from the Sessions tab.',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        description: 'Auto-synced from the earliest session date when Session Plan is filled.',
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'Auto-synced from the latest session date when Session Plan is filled.',
      },
    },
    { name: 'timezone', type: 'text', defaultValue: 'Africa/Cairo' },
    {
      name: 'locationType',
      type: 'select',
      options: ['online', 'in-person', 'hybrid'],
      defaultValue: 'online',
    },
    { name: 'locationName', type: 'text' },
    { name: 'locationAddress', type: 'text' },
    { name: 'locationMapUrl', type: 'text' },
    { name: 'meetingUrl', type: 'text' },
    { name: 'maxCapacity', type: 'number', required: true },
    { name: 'currentEnrollments', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'price', type: 'number', required: true },
    { name: 'earlyBirdPrice', type: 'number' },
    { name: 'earlyBirdDeadline', type: 'date' },
    {
      name: 'currency',
      type: 'select',
      options: ['EGP', 'USD', 'EUR'],
      defaultValue: 'EGP',
    },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'upcoming', 'open', 'full', 'in_progress', 'cancelled', 'completed'],
      defaultValue: 'draft',
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'autoCloseOnFull', type: 'checkbox', defaultValue: true },
    { name: 'reminderSent', type: 'checkbox', defaultValue: false },
    { name: 'notes', type: 'textarea' },
  ],
};
