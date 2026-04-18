import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import type { ConsultationAvailability } from '@/payload-types';
import config from '@payload-config';
import { syncInstructorConsultationSlots } from '@/lib/instructor-slot-sync';

const INDEX_TO_DAY = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const DAY_TO_INDEX: Record<(typeof INDEX_TO_DAY)[number], 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

type ScopeError = { status: number; error: string };
type InstructorScope = {
  payload: Awaited<ReturnType<typeof getPayload>>;
  instructorId: number;
};

function relationToId(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const rawId = (value as { id?: unknown }).id;
    if (typeof rawId === 'number') return rawId;
    if (typeof rawId === 'string') {
      const parsed = Number(rawId);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

function parsePositiveInt(input: string | null, fallback: number, max: number): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

async function resolveInstructorScope(req: NextRequest): Promise<InstructorScope | ScopeError> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as { role?: string | null; instructorId?: unknown } | null;

  if (!authUser) return { status: 401, error: 'Unauthorized' };

  if (authUser.role === 'admin') {
    const instructorParam = req.nextUrl.searchParams.get('instructorId');
    if (instructorParam) {
      const parsed = relationToId(instructorParam);
      if (!parsed) return { status: 400, error: 'Invalid instructorId' };
      return { payload, instructorId: parsed };
    }

    const ownInstructorId = relationToId(authUser.instructorId);
    if (ownInstructorId) return { payload, instructorId: ownInstructorId };

    return {
      status: 400,
      error: 'instructorId query parameter is required for admin when no instructorId is linked',
    };
  }

  if (authUser.role !== 'instructor') return { status: 403, error: 'Forbidden' };

  const instructorId = relationToId(authUser.instructorId);
  if (!instructorId) return { status: 403, error: 'No instructor profile linked to this account' };

  return { payload, instructorId };
}

function normalizeDayIndex(value: unknown): 0 | 1 | 2 | 3 | 4 | 5 | 6 | null {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0 || numeric > 6) return null;
  return numeric as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

function dayFromDoc(doc: Pick<ConsultationAvailability, 'dayOfWeek'> & { dayIndex?: number | null }) {
  if (typeof doc.dayIndex === 'number' && doc.dayIndex >= 0 && doc.dayIndex <= 6) {
    return doc.dayIndex as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  }

  if (doc.dayOfWeek && doc.dayOfWeek in DAY_TO_INDEX) {
    return DAY_TO_INDEX[doc.dayOfWeek as keyof typeof DAY_TO_INDEX];
  }

  return 0;
}

async function findAllInstructorAvailability(
  payload: Awaited<ReturnType<typeof getPayload>>,
  instructorId: number,
) {
  const docs: ConsultationAvailability[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await payload.find({
      collection: 'consultation-availability',
      where: { instructor: { equals: instructorId } },
      depth: 0,
      limit: 100,
      page,
      sort: 'dayIndex',
      overrideAccess: true,
    });

    docs.push(...(result.docs as ConsultationAvailability[]));
    totalPages = result.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return docs;
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, instructorId } = scope;
    const page = parsePositiveInt(req.nextUrl.searchParams.get('page'), 1, 10_000);
    const limit = parsePositiveInt(req.nextUrl.searchParams.get('limit'), 50, 200);

    const result = await payload.find({
      collection: 'consultation-availability',
      where: { instructor: { equals: instructorId } },
      depth: 0,
      page,
      limit,
      sort: 'dayIndex',
      overrideAccess: true,
    });

    const docs = (result.docs as ConsultationAvailability[]).map((doc) => {
      const dayIndex = dayFromDoc(doc as ConsultationAvailability & { dayIndex?: number | null });
      return {
        id: String(doc.id),
        dayOfWeek: dayIndex,
        dayIndex,
        startTime: doc.startTime,
        endTime: doc.endTime,
        bufferMinutes: doc.bufferMinutes ?? 15,
        isActive: doc.isActive !== false,
        instructor: String(instructorId),
      };
    });

    return NextResponse.json({
      docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[api/instructor/availability][GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch instructor availability' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, instructorId } = scope;
    const body = (await req.json().catch(() => null)) as
      | {
          availability?: Array<{
            dayOfWeek?: number;
            dayIndex?: number;
            startTime?: string;
            endTime?: string;
            bufferMinutes?: number;
            isActive?: boolean;
          }>;
        }
      | null;

    if (!body || !Array.isArray(body.availability)) {
      return NextResponse.json(
        { error: 'availability array is required' },
        { status: 400 },
      );
    }

    const normalized = body.availability.map((item, index) => {
      const dayIndex = normalizeDayIndex(item.dayOfWeek ?? item.dayIndex);
      if (dayIndex === null) {
        throw new Error(`Invalid day index at item ${index + 1}`);
      }

      if (!item.startTime || !item.endTime) {
        throw new Error(`startTime and endTime are required at item ${index + 1}`);
      }

      const bufferMinutes =
        typeof item.bufferMinutes === 'number' && item.bufferMinutes >= 0
          ? Math.floor(item.bufferMinutes)
          : 15;

      return {
        dayIndex,
        dayOfWeek: INDEX_TO_DAY[dayIndex],
        startTime: item.startTime,
        endTime: item.endTime,
        bufferMinutes,
        isActive: item.isActive !== false,
      };
    });

    const existing = await findAllInstructorAvailability(payload, instructorId);
    await Promise.all(
      existing.map((doc) =>
        payload.delete({
          collection: 'consultation-availability',
          id: doc.id,
          overrideAccess: true,
        }),
      ),
    );

    await Promise.all(
      normalized.map((item) =>
        (payload as any).create(
          {
            collection: 'consultation-availability',
            data: {
              instructor: instructorId,
              dayOfWeek: item.dayOfWeek,
              dayIndex: item.dayIndex,
              startTime: item.startTime,
              endTime: item.endTime,
              bufferMinutes: item.bufferMinutes,
              isActive: item.isActive,
            },
            overrideAccess: true,
          } as any,
        ),
      ),
    );

    try {
      await syncInstructorConsultationSlots({
        payload: payload as any,
        instructorId,
              });
    } catch (syncError) {
      console.error('[api/instructor/availability][PUT] slot sync failed', syncError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save instructor availability';
    const status = message.startsWith('Invalid day index') || message.includes('required at item') ? 400 : 500;

    if (status === 500) {
      console.error('[api/instructor/availability][PUT]', error);
    }

    return NextResponse.json({ error: message }, { status });
  }
}
