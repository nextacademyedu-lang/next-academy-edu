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

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeSubmissionData(input: Record<string, unknown>) {
  const next: Record<string, unknown> = {};
  if (input.type !== undefined) {
    next.type =
      input.type === 'workshop' || input.type === 'webinar' || input.type === 'course'
        ? input.type
        : 'course';
  }
  if (input.titleAr !== undefined) next.titleAr = sanitizeText(input.titleAr);
  if (input.titleEn !== undefined) next.titleEn = sanitizeText(input.titleEn);
  if (input.shortDescriptionAr !== undefined) next.shortDescriptionAr = sanitizeText(input.shortDescriptionAr);
  if (input.shortDescriptionEn !== undefined) next.shortDescriptionEn = sanitizeText(input.shortDescriptionEn);
  if (input.descriptionAr !== undefined) next.descriptionAr = sanitizeText(input.descriptionAr);
  if (input.descriptionEn !== undefined) next.descriptionEn = sanitizeText(input.descriptionEn);
  if (input.categoryName !== undefined) next.categoryName = sanitizeText(input.categoryName);
  if (input.durationHours !== undefined) {
    next.durationHours =
      Number.isFinite(Number(input.durationHours)) && Number(input.durationHours) >= 0
        ? Number(input.durationHours)
        : null;
  }
  if (input.sessionsCount !== undefined) {
    next.sessionsCount =
      Number.isFinite(Number(input.sessionsCount)) && Number(input.sessionsCount) > 0
        ? Math.floor(Number(input.sessionsCount))
        : null;
  }
  if (input.language !== undefined) {
    next.language = input.language === 'en' || input.language === 'both' ? input.language : 'ar';
  }
  if (input.level !== undefined) {
    next.level =
      input.level === 'beginner' || input.level === 'intermediate' || input.level === 'advanced'
        ? input.level
        : null;
  }
  if (input.price !== undefined) {
    next.price = Number.isFinite(Number(input.price)) ? Number(input.price) : null;
  }
  if (input.currency !== undefined) {
    next.currency =
      input.currency === 'USD' || input.currency === 'EUR' || input.currency === 'EGP'
        ? input.currency
        : 'EGP';
  }
  if (input.objectivesText !== undefined) next.objectivesText = sanitizeText(input.objectivesText);
  if (input.requirementsText !== undefined) next.requirementsText = sanitizeText(input.requirementsText);
  if (input.targetAudienceText !== undefined) next.targetAudienceText = sanitizeText(input.targetAudienceText);
  if (input.extraNotes !== undefined) next.extraNotes = sanitizeText(input.extraNotes);
  if (input.sessionOutline !== undefined) {
    next.sessionOutline = Array.isArray(input.sessionOutline)
      ? input.sessionOutline
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => {
            const row = entry as Record<string, unknown>;
            const title = sanitizeText(row.title);
            if (!title) return null;
            return {
              title,
              sessionNumber:
                Number.isFinite(Number(row.sessionNumber)) && Number(row.sessionNumber) > 0
                  ? Math.floor(Number(row.sessionNumber))
                  : undefined,
              summary: sanitizeText(row.summary),
            };
          })
          .filter(Boolean)
      : [];
  }
  return next;
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

async function getOwnedSubmission(params: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  req: NextRequest;
  id: number;
  userId: number;
  instructorId: number;
}) {
  const { payload, req, id, userId, instructorId } = params;
  const result = await payload.find({
    collection: 'instructor-program-submissions',
    where: {
      and: [
        { id: { equals: id } },
        { instructor: { equals: instructorId } },
        { submittedBy: { equals: userId } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
    req,
  });

  return result.docs[0] || null;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveScope(req);
    if ('error' in scope) return NextResponse.json({ error: scope.error }, { status: scope.status });

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const owned = await getOwnedSubmission({
      payload: scope.payload,
      req,
      id,
      userId: scope.userId,
      instructorId: scope.instructorId,
    });
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const data = normalizeSubmissionData(body);
    data.status = 'draft';
    data.reviewedAt = null;
    data.reviewNotes = null;

    const updated = await (scope.payload as any).update({
      collection: 'instructor-program-submissions',
      id,
      data,
      overrideAccess: true,
      req,
    } as any);

    return NextResponse.json({ doc: updated });
  } catch (error) {
    console.error('[api/instructor/program-submissions/:id][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveScope(req);
    if ('error' in scope) return NextResponse.json({ error: scope.error }, { status: scope.status });

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const owned = await getOwnedSubmission({
      payload: scope.payload,
      req,
      id,
      userId: scope.userId,
      instructorId: scope.instructorId,
    });
    if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await scope.payload.delete({
      collection: 'instructor-program-submissions',
      id,
      overrideAccess: true,
      req,
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[api/instructor/program-submissions/:id][DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
  }
}
