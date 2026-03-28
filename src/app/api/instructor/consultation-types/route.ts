import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { ConsultationType } from '@/payload-types';

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

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function resolveInstructorScope(req: NextRequest): Promise<InstructorScope | ScopeError> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as { role?: string | null; instructorId?: unknown } | null;

  if (!authUser) return { status: 401, error: 'Unauthorized' };
  if (authUser.role !== 'instructor') return { status: 403, error: 'Forbidden' };

  const instructorId = relationToId(authUser.instructorId);
  if (!instructorId) return { status: 403, error: 'No instructor profile linked to this account' };

  return { payload, instructorId };
}

function mapDoc(doc: ConsultationType) {
  const title =
    doc.title ||
    doc.titleEn ||
    doc.titleAr ||
    'Consultation';

  return {
    id: String(doc.id),
    title,
    titleAr: doc.titleAr || title,
    titleEn: doc.titleEn || '',
    description: doc.description || doc.descriptionEn || doc.descriptionAr || '',
    descriptionAr: doc.descriptionAr || '',
    descriptionEn: doc.descriptionEn || '',
    durationMinutes: doc.durationMinutes || 30,
    price: doc.price || 0,
    currency: doc.currency || 'EGP',
    meetingType: doc.meetingType || 'online',
    meetingPlatform: doc.meetingPlatform || '',
    maxParticipants: doc.maxParticipants || 1,
    isActive: doc.isActive !== false,
    instructor: String(
      relationToId(doc.instructor) || '',
    ),
  };
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const result = await scope.payload.find({
      collection: 'consultation-types',
      where: { instructor: { equals: scope.instructorId } },
      depth: 0,
      limit: 100,
      sort: '-updatedAt',
      overrideAccess: true,
      req,
    });

    return NextResponse.json({
      docs: (result.docs as ConsultationType[]).map(mapDoc),
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[api/instructor/consultation-types][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch consultation types' }, { status: 500 });
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

    const title = sanitizeText(body.title) || sanitizeText(body.titleAr) || sanitizeText(body.titleEn);
    const description =
      sanitizeText(body.description) || sanitizeText(body.descriptionAr) || sanitizeText(body.descriptionEn);
    const durationMinutes = Number(body.durationMinutes);
    const price = Number(body.price);

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return NextResponse.json({ error: 'durationMinutes must be a positive number' }, { status: 400 });
    }
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'price must be a valid non-negative number' }, { status: 400 });
    }

    const doc = await (scope.payload as any).create({
      collection: 'consultation-types',
      data: {
        instructor: scope.instructorId,
        titleAr: sanitizeText(body.titleAr) || title,
        titleEn: sanitizeText(body.titleEn),
        title,
        descriptionAr: sanitizeText(body.descriptionAr) || description,
        descriptionEn: sanitizeText(body.descriptionEn),
        description,
        durationMinutes: Math.floor(durationMinutes),
        price,
        currency: body.currency === 'USD' ? 'USD' : 'EGP',
        meetingType:
          body.meetingType === 'in-person' || body.meetingType === 'both' ? body.meetingType : 'online',
        meetingPlatform: sanitizeText(body.meetingPlatform),
        maxParticipants:
          Number.isFinite(Number(body.maxParticipants)) && Number(body.maxParticipants) > 0
            ? Math.floor(Number(body.maxParticipants))
            : 1,
        isActive: body.isActive !== false,
      },
      overrideAccess: true,
      req,
    } as any);

    return NextResponse.json({ doc: mapDoc(doc as ConsultationType) });
  } catch (error) {
    console.error('[api/instructor/consultation-types][POST]', error);
    return NextResponse.json({ error: 'Failed to create consultation type' }, { status: 500 });
  }
}
