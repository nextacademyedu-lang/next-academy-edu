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

async function resolveInstructorScope(req: NextRequest): Promise<InstructorScope | ScopeError> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as { role?: string | null; instructorId?: unknown } | null;

  if (!authUser) return { status: 401, error: 'Unauthorized' };
  if (authUser.role !== 'instructor' && authUser.role !== 'admin') return { status: 403, error: 'Forbidden' };

  if (authUser.role === 'admin') {
    const ownInstructorId = relationToId(authUser.instructorId);
    if (ownInstructorId) return { payload, instructorId: ownInstructorId };
    return { status: 400, error: 'instructorId is required for admin actions' };
  }

  const instructorId = relationToId(authUser.instructorId);
  if (!instructorId) return { status: 403, error: 'No instructor profile linked to this account' };
  return { payload, instructorId };
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: rawId } = await context.params;
    const blockedDateId = Number(rawId);
    if (!Number.isFinite(blockedDateId)) {
      return NextResponse.json({ error: 'Invalid blocked date id' }, { status: 400 });
    }

    const existing = await scope.payload.find({
      collection: 'instructor-blocked-dates',
      where: {
        and: [{ id: { equals: blockedDateId } }, { instructor: { equals: scope.instructorId } }],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    });

    if (!existing.docs.length) {
      return NextResponse.json({ error: 'Blocked date not found' }, { status: 404 });
    }

    await scope.payload.delete({
      collection: 'instructor-blocked-dates',
      id: blockedDateId,
      overrideAccess: true,
      req,
    });

    try {
      await syncInstructorConsultationSlots({
        payload: scope.payload as any,
        instructorId: scope.instructorId,
        req,
      });
    } catch (syncError) {
      console.error('[api/instructor/blocked-dates/:id][DELETE] slot sync failed', syncError);
    }

    return NextResponse.json({ deleted: true, id: String(blockedDateId) });
  } catch (error) {
    console.error('[api/instructor/blocked-dates/:id][DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete blocked date' }, { status: 500 });
  }
}
