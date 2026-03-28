import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type ScopeError = { status: number; error: string };
type InstructorScope = {
  payload: Awaited<ReturnType<typeof getPayload>>;
  instructorId: number;
  userId: number;
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

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function resolveInstructorScope(req: NextRequest): Promise<InstructorScope | ScopeError> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as { id?: unknown; role?: string | null; instructorId?: unknown } | null;

  if (!authUser) return { status: 401, error: 'Unauthorized' };
  if (authUser.role !== 'instructor') return { status: 403, error: 'Forbidden' };

  const userId = relationToId(authUser.id);
  const instructorId = relationToId(authUser.instructorId);
  if (!userId) return { status: 403, error: 'Invalid user context' };
  if (!instructorId) return { status: 403, error: 'No instructor profile linked to this account' };

  return { payload, instructorId, userId };
}

function normalizeSubmissionData(input: Record<string, unknown>) {
  return {
    type:
      input.type === 'workshop' || input.type === 'webinar' || input.type === 'course'
        ? input.type
        : 'course',
    titleAr: sanitizeText(input.titleAr),
    titleEn: sanitizeText(input.titleEn),
    shortDescriptionAr: sanitizeText(input.shortDescriptionAr),
    shortDescriptionEn: sanitizeText(input.shortDescriptionEn),
    descriptionAr: sanitizeText(input.descriptionAr),
    descriptionEn: sanitizeText(input.descriptionEn),
    categoryName: sanitizeText(input.categoryName),
    durationHours:
      Number.isFinite(Number(input.durationHours)) && Number(input.durationHours) >= 0
        ? Number(input.durationHours)
        : undefined,
    sessionsCount:
      Number.isFinite(Number(input.sessionsCount)) && Number(input.sessionsCount) > 0
        ? Math.floor(Number(input.sessionsCount))
        : undefined,
    language: input.language === 'en' || input.language === 'both' ? input.language : 'ar',
    level:
      input.level === 'beginner' || input.level === 'intermediate' || input.level === 'advanced'
        ? input.level
        : undefined,
    price: Number.isFinite(Number(input.price)) ? Number(input.price) : undefined,
    currency:
      input.currency === 'USD' || input.currency === 'EUR' || input.currency === 'EGP'
        ? input.currency
        : 'EGP',
    objectivesText: sanitizeText(input.objectivesText),
    requirementsText: sanitizeText(input.requirementsText),
    targetAudienceText: sanitizeText(input.targetAudienceText),
    extraNotes: sanitizeText(input.extraNotes),
    sessionOutline: Array.isArray(input.sessionOutline)
      ? input.sessionOutline
          .filter((entry) => entry && typeof entry === 'object')
          .map((entry) => {
            const row = entry as Record<string, unknown>;
            const title = sanitizeText(row.title);
            if (!title) return null;
            const sessionNumber =
              Number.isFinite(Number(row.sessionNumber)) && Number(row.sessionNumber) > 0
                ? Math.floor(Number(row.sessionNumber))
                : undefined;
            return {
              title,
              sessionNumber,
              summary: sanitizeText(row.summary),
            };
          })
          .filter(Boolean)
      : undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const result = await scope.payload.find({
      collection: 'instructor-program-submissions',
      where: {
        and: [
          { instructor: { equals: scope.instructorId } },
          { submittedBy: { equals: scope.userId } },
        ],
      },
      depth: 0,
      sort: '-updatedAt',
      limit: 100,
      overrideAccess: true,
      req,
    });

    return NextResponse.json({
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[api/instructor/program-submissions][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const normalized = normalizeSubmissionData(body);
    if (!normalized.titleAr) {
      return NextResponse.json({ error: 'titleAr is required' }, { status: 400 });
    }
    if (!normalized.shortDescriptionAr) {
      return NextResponse.json({ error: 'shortDescriptionAr is required' }, { status: 400 });
    }
    if (!normalized.descriptionAr) {
      return NextResponse.json({ error: 'descriptionAr is required' }, { status: 400 });
    }
    if (!normalized.sessionsCount) {
      return NextResponse.json({ error: 'sessionsCount must be greater than 0' }, { status: 400 });
    }

    const doc = await (scope.payload as any).create({
      collection: 'instructor-program-submissions',
      data: {
        ...normalized,
        instructor: scope.instructorId,
        submittedBy: scope.userId,
        status: 'draft',
      },
      overrideAccess: true,
      req,
    } as any);

    return NextResponse.json({ doc });
  } catch (error) {
    console.error('[api/instructor/program-submissions][POST]', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}
