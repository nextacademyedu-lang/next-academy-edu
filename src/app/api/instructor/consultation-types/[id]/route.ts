import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import type { ConsultationType } from '@/payload-types';

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
    instructor: String(relationToId(doc.instructor) || ''),
  };
}

async function resolveScope(req: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as { role?: string | null; instructorId?: unknown } | null;
  if (!authUser) return { error: 'Unauthorized', status: 401 as const };
  if (authUser.role !== 'instructor') return { error: 'Forbidden', status: 403 as const };
  const instructorId = relationToId(authUser.instructorId);
  if (!instructorId) return { error: 'No instructor profile linked to this account', status: 403 as const };
  return { payload, instructorId };
}

async function verifyOwnership(payload: Awaited<ReturnType<typeof getPayload>>, req: NextRequest, id: number, instructorId: number) {
  const result = await payload.find({
    collection: 'consultation-types',
    where: {
      and: [{ id: { equals: id } }, { instructor: { equals: instructorId } }],
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
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const owned = await verifyOwnership(scope.payload, req, id, scope.instructorId);
    if (!owned) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (body.title !== undefined || body.titleAr !== undefined || body.titleEn !== undefined) {
      const title = sanitizeText(body.title) || sanitizeText(body.titleAr) || sanitizeText(body.titleEn);
      if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 });
      data.title = title;
      data.titleAr = sanitizeText(body.titleAr) || title;
      data.titleEn = sanitizeText(body.titleEn);
    }
    if (body.description !== undefined || body.descriptionAr !== undefined || body.descriptionEn !== undefined) {
      const description =
        sanitizeText(body.description) || sanitizeText(body.descriptionAr) || sanitizeText(body.descriptionEn);
      data.description = description;
      data.descriptionAr = sanitizeText(body.descriptionAr) || description;
      data.descriptionEn = sanitizeText(body.descriptionEn);
    }
    if (body.durationMinutes !== undefined) {
      const duration = Number(body.durationMinutes);
      if (!Number.isFinite(duration) || duration <= 0) {
        return NextResponse.json({ error: 'durationMinutes must be a positive number' }, { status: 400 });
      }
      data.durationMinutes = Math.floor(duration);
    }
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'price must be a valid non-negative number' }, { status: 400 });
      }
      data.price = price;
    }
    if (body.currency !== undefined) {
      data.currency = body.currency === 'USD' ? 'USD' : 'EGP';
    }
    if (body.meetingType !== undefined) {
      data.meetingType =
        body.meetingType === 'in-person' || body.meetingType === 'both' ? body.meetingType : 'online';
    }
    if (body.meetingPlatform !== undefined) {
      data.meetingPlatform = sanitizeText(body.meetingPlatform);
    }
    if (body.maxParticipants !== undefined) {
      const maxParticipants = Number(body.maxParticipants);
      if (!Number.isFinite(maxParticipants) || maxParticipants <= 0) {
        return NextResponse.json({ error: 'maxParticipants must be a positive number' }, { status: 400 });
      }
      data.maxParticipants = Math.floor(maxParticipants);
    }
    if (body.isActive !== undefined) {
      data.isActive = body.isActive !== false;
    }

    const updated = await (scope.payload as any).update({
      collection: 'consultation-types',
      id,
      data,
      overrideAccess: true,
      req,
    } as any);

    return NextResponse.json({ doc: mapDoc(updated as ConsultationType) });
  } catch (error) {
    console.error('[api/instructor/consultation-types/:id][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update consultation type' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: rawId } = await context.params;
    const id = Number(rawId);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const owned = await verifyOwnership(scope.payload, req, id, scope.instructorId);
    if (!owned) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await scope.payload.delete({
      collection: 'consultation-types',
      id,
      overrideAccess: true,
      req,
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[api/instructor/consultation-types/:id][DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete consultation type' }, { status: 500 });
  }
}
