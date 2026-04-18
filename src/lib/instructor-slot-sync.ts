import type { NextRequest } from 'next/server';

type PayloadClient = {
  find: (args: Record<string, unknown>) => Promise<{
    docs: Record<string, unknown>[];
    totalPages?: number | null;
  }>;
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  delete: (args: Record<string, unknown>) => Promise<unknown>;
};

type SyncParams = {
  payload: PayloadClient;
  instructorId: number;
  req?: NextRequest;
  horizonDays?: number;
  now?: Date;
};

const DAY_TO_INDEX: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function relationToId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const nested = (value as { id?: unknown }).id;
    if (typeof nested === 'number' && Number.isFinite(nested)) return nested;
    if (typeof nested === 'string') {
      const parsed = Number(nested);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

function parseDayIndex(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : null;
}

function parseTimeToMinutes(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const [hourRaw, minuteRaw] = value.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function minutesToTime(value: number): string {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function chunkArray<T>(list: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size));
  }
  return chunks;
}

async function findAllDocs(payload: PayloadClient, args: Record<string, unknown>) {
  const docs: Record<string, unknown>[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await payload.find({
      ...args,
      page,
      limit: 200,
      depth: 0,
      overrideAccess: true,
    });

    docs.push(...(result.docs || []));
    totalPages = Number(result.totalPages) || 1;
    page += 1;
  } while (page <= totalPages);

  return docs;
}

/**
 * Rebuilds future "available" consultation slots from:
 * - instructor active consultation types
 * - instructor weekly availability
 * - blocked dates
 *
 * Booked/cancelled slots are preserved.
 */
export async function syncInstructorConsultationSlots(params: SyncParams) {
  const { payload, instructorId, req } = params;
  const horizonDays = Math.max(1, Math.min(90, params.horizonDays ?? 21));
  const now = params.now || new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayIso = todayUtc.toISOString();

  const [types, availability, blockedDates, existingAvailableSlots] = await Promise.all([
    findAllDocs(payload, {
      collection: 'consultation-types',
      where: {
        and: [{ instructor: { equals: instructorId } }, { isActive: { equals: true } }],
      },
    }),
    findAllDocs(payload, {
      collection: 'consultation-availability',
      where: {
        and: [{ instructor: { equals: instructorId } }, { isActive: { equals: true } }],
      },
      sort: 'dayIndex',
    }),
    findAllDocs(payload, {
      collection: 'instructor-blocked-dates',
      where: {
        and: [{ instructor: { equals: instructorId } }, { date: { greater_than_equal: todayIso } }],
      },
    }),
    findAllDocs(payload, {
      collection: 'consultation-slots',
      where: {
        and: [
          { instructor: { equals: instructorId } },
          { status: { equals: 'available' } },
          { date: { greater_than_equal: todayIso } },
        ],
      },
    }),
  ]);

  for (const chunk of chunkArray(existingAvailableSlots, 50)) {
    await Promise.all(
      chunk.map((slot) =>
        payload.delete({
          collection: 'consultation-slots',
          id: slot.id,
          overrideAccess: true,
        }),
      ),
    );
  }

  if (!types.length || !availability.length) {
    return { createdSlots: 0, deletedSlots: existingAvailableSlots.length };
  }

  const blockedDateKeys = new Set<string>();
  for (const blocked of blockedDates) {
    const raw = blocked.date;
    if (typeof raw !== 'string') continue;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) continue;
    blockedDateKeys.add(toDateKey(parsed));
  }

  const availabilityByDay = new Map<number, Record<string, unknown>[]>();
  for (const row of availability) {
    const directDayIndex = parseDayIndex(row.dayIndex);
    const dayByName =
      typeof row.dayOfWeek === 'string' ? DAY_TO_INDEX[row.dayOfWeek.toLowerCase()] : undefined;
    const dayIndex = directDayIndex ?? dayByName;
    if (dayIndex === undefined) continue;

    const rows = availabilityByDay.get(dayIndex) || [];
    rows.push(row);
    availabilityByDay.set(dayIndex, rows);
  }

  const dedupe = new Set<string>();
  const createPayloads: Array<Record<string, unknown>> = [];

  for (let offset = 0; offset <= horizonDays; offset += 1) {
    const date = new Date(todayUtc);
    date.setUTCDate(date.getUTCDate() + offset);
    const dateKey = toDateKey(date);
    if (blockedDateKeys.has(dateKey)) continue;

    const dayRows = availabilityByDay.get(date.getUTCDay()) || [];
    if (!dayRows.length) continue;

    for (const dayRow of dayRows) {
      const startMinutes = parseTimeToMinutes(dayRow.startTime);
      const endMinutes = parseTimeToMinutes(dayRow.endTime);
      if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) continue;

      const bufferMinutesRaw = Number(dayRow.bufferMinutes);
      const bufferMinutes =
        Number.isFinite(bufferMinutesRaw) && bufferMinutesRaw >= 0
          ? Math.floor(bufferMinutesRaw)
          : 0;

      for (const type of types) {
        const typeId = relationToId(type.id);
        if (!typeId) continue;
        const durationRaw = Number(type.durationMinutes);
        const durationMinutes =
          Number.isFinite(durationRaw) && durationRaw > 0 ? Math.floor(durationRaw) : 30;
        const step = durationMinutes + bufferMinutes;
        if (step <= 0) continue;

        let cursor = startMinutes;
        while (cursor + durationMinutes <= endMinutes) {
          const slotStart = minutesToTime(cursor);
          const slotEnd = minutesToTime(cursor + durationMinutes);
          const dedupeKey = `${typeId}|${dateKey}|${slotStart}|${slotEnd}`;

          if (!dedupe.has(dedupeKey)) {
            dedupe.add(dedupeKey);
            createPayloads.push({
              consultationType: typeId,
              instructor: instructorId,
              date: `${dateKey}T00:00:00.000Z`,
              startTime: slotStart,
              endTime: slotEnd,
              status: 'available',
            });
          }

          cursor += step;
        }
      }
    }
  }

  for (const chunk of chunkArray(createPayloads, 40)) {
    await Promise.all(
      chunk.map((data) =>
        payload.create({
          collection: 'consultation-slots',
          data,
          overrideAccess: true,
        }),
      ),
    );
  }

  return {
    createdSlots: createPayloads.length,
    deletedSlots: existingAvailableSlots.length,
  };
}
