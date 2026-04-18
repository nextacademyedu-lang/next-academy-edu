import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

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

async function resolveScope(req: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as { id?: unknown; role?: string | null; instructorId?: unknown } | null;
  if (!authUser) return { error: 'Unauthorized', status: 401 as const };
  if (authUser.role !== 'instructor') return { error: 'Forbidden', status: 403 as const };
  const userId = relationToId(authUser.id);
  const instructorId = relationToId(authUser.instructorId);
  if (!userId || !instructorId) return { error: 'No instructor profile linked to this account', status: 403 as const };
  return { payload, userId, instructorId };
}

function isValidSubmission(doc: Record<string, unknown>): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!doc.titleAr || String(doc.titleAr).trim() === '') missing.push('titleAr');
  if (!doc.shortDescriptionAr || String(doc.shortDescriptionAr).trim() === '') missing.push('shortDescriptionAr');
  if (!doc.descriptionAr || String(doc.descriptionAr).trim() === '') missing.push('descriptionAr');
  const sessionsCount = Number(doc.sessionsCount);
  if (!Number.isFinite(sessionsCount) || sessionsCount <= 0) missing.push('sessionsCount');
  return { valid: missing.length === 0, missing };
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveScope(req);
    if ('error' in scope) return NextResponse.json({ error: scope.error }, { status: scope.status });

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const result = await scope.payload.find({
      collection: 'instructor-program-submissions',
      where: {
        and: [
          { id: { equals: id } },
          { instructor: { equals: scope.instructorId } },
          { submittedBy: { equals: scope.userId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    const doc = result.docs[0];
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const validation = isValidSubmission(doc as unknown as Record<string, unknown>);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Submission is incomplete', missingFields: validation.missing },
        { status: 400 },
      );
    }

    const updated = await (scope.payload as any).update({
      collection: 'instructor-program-submissions',
      id,
      data: {
        status: 'pending',
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    } as any);

    return NextResponse.json({ submitted: true, doc: updated });
  } catch (error) {
    console.error('[api/instructor/program-submissions/:id/submit][POST]', error);
    return NextResponse.json({ error: 'Failed to submit program proposal' }, { status: 500 });
  }
}
