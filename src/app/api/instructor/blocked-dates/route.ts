import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { syncInstructorConsultationSlots } from '@/lib/instructor-slot-sync';

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

function normalizeDateInput(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const asDate = new Date(trimmed);
  if (Number.isNaN(asDate.getTime())) return null;

  const year = asDate.getUTCFullYear();
  const month = String(asDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(asDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00.000Z`;
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

function mapDoc(doc: Record<string, unknown>, fallbackInstructorId: number) {
  const instructor = relationToId(doc.instructor) || fallbackInstructorId;

  return {
    id: String(doc.id),
    date: typeof doc.date === 'string' ? doc.date : '',
    reason: typeof doc.reason === 'string' ? doc.reason : '',
    instructor: String(instructor),
  };
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const page = parsePositiveInt(req.nextUrl.searchParams.get('page'), 1, 10_000);
    const limit = parsePositiveInt(req.nextUrl.searchParams.get('limit'), 50, 200);

    const result = await scope.payload.find({
      collection: 'instructor-blocked-dates',
      where: { instructor: { equals: scope.instructorId } },
      depth: 0,
      sort: 'date',
      page,
      limit,
      overrideAccess: true,
          });

    return NextResponse.json({
      docs: result.docs.map((doc) =>
        mapDoc(doc as unknown as Record<string, unknown>, scope.instructorId),
      ),
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[api/instructor/blocked-dates][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch blocked dates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      date?: unknown;
      reason?: unknown;
    } | null;

    const normalizedDate = normalizeDateInput(body?.date);
    if (!normalizedDate) {
      return NextResponse.json({ error: 'Valid date is required' }, { status: 400 });
    }

    const reason =
      typeof body?.reason === 'string' && body.reason.trim().length > 0
        ? body.reason.trim()
        : undefined;

    const created = await (scope.payload as any).create({
      collection: 'instructor-blocked-dates',
      data: {
        instructor: scope.instructorId,
        date: normalizedDate,
        reason,
      },
      overrideAccess: true,
          });

    try {
      await syncInstructorConsultationSlots({
        payload: scope.payload as any,
        instructorId: scope.instructorId,
              });
    } catch (syncError) {
      console.error('[api/instructor/blocked-dates][POST] slot sync failed', syncError);
    }

    return NextResponse.json({
      doc: mapDoc(created as Record<string, unknown>, scope.instructorId),
    });
  } catch (error) {
    console.error('[api/instructor/blocked-dates][POST]', error);
    return NextResponse.json({ error: 'Failed to create blocked date' }, { status: 500 });
  }
}
