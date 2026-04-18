import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type ScopeError = { status: number; error: string };
type InstructorScope = {
  payload: Awaited<ReturnType<typeof getPayload>>;
  instructorId: number;
};

type MaterialDoc = {
  id: number | string;
  filename?: string | null;
  alt?: string | null;
  url?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
};

type SessionDoc = {
  id: number | string;
  materials?: Array<number | string | MaterialDoc> | null;
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

function normalizeMaterialRow(value: number | string | MaterialDoc) {
  if (typeof value === 'number' || typeof value === 'string') {
    return {
      id: String(value),
      name: `Material ${value}`,
      url: null as string | null,
      mimeType: null as string | null,
      filesize: null as number | null,
    };
  }

  const fallbackName =
    (typeof value.alt === 'string' && value.alt.trim()) ||
    (typeof value.filename === 'string' && value.filename.trim()) ||
    `Material ${value.id}`;

  return {
    id: String(value.id),
    name: fallbackName,
    url: typeof value.url === 'string' ? value.url : null,
    mimeType: typeof value.mimeType === 'string' ? value.mimeType : null,
    filesize: typeof value.filesize === 'number' ? value.filesize : null,
  };
}

function uniqueIds(ids: number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
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

async function getOwnedSession(params: {
  payload: Awaited<ReturnType<typeof getPayload>>;
  sessionId: number;
  instructorId: number;
  depth?: number;
}) {
  const { payload, sessionId, instructorId, depth = 1 } = params;
  const result = await payload.find({
    collection: 'sessions',
    where: {
      and: [{ id: { equals: sessionId } }, { instructor: { equals: instructorId } }],
    },
    depth,
    limit: 1,
    overrideAccess: true,
  });

  return (result.docs[0] as SessionDoc | undefined) || null;
}

function sessionMaterials(session: SessionDoc | null) {
  const rows = Array.isArray(session?.materials) ? session.materials : [];
  return rows.map((row) => normalizeMaterialRow(row as number | string | MaterialDoc));
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: rawId } = await context.params;
    const sessionId = Number(rawId);
    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    const session = await getOwnedSession({
      payload: scope.payload,
      sessionId,
      instructorId: scope.instructorId,
      depth: 1,
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: String(session.id),
      materials: sessionMaterials(session),
    });
  } catch (error) {
    console.error('[api/instructor/sessions/:id/materials][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch session materials' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: rawId } = await context.params;
    const sessionId = Number(rawId);
    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    const ownedSession = await getOwnedSession({
      payload: scope.payload,
      sessionId,
      instructorId: scope.instructorId,
      depth: 0,
    });
    if (!ownedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = (await req.json().catch(() => null)) as { materialIds?: unknown[] } | null;
    if (!body || !Array.isArray(body.materialIds)) {
      return NextResponse.json({ error: 'materialIds array is required' }, { status: 400 });
    }

    const normalizedIds = uniqueIds(
      body.materialIds
        .map((value) => relationToId(value))
        .filter((value): value is number => value !== null),
    );

    await scope.payload.update({
      collection: 'sessions',
      id: sessionId,
      data: { materials: normalizedIds },
      overrideAccess: true,
    });

    const updated = await getOwnedSession({
      payload: scope.payload,
      sessionId,
      instructorId: scope.instructorId,
      depth: 1,
    });

    return NextResponse.json({
      sessionId: String(sessionId),
      materials: sessionMaterials(updated),
    });
  } catch (error) {
    console.error('[api/instructor/sessions/:id/materials][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update session materials' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const scope = await resolveInstructorScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: rawId } = await context.params;
    const sessionId = Number(rawId);
    if (!Number.isFinite(sessionId)) {
      return NextResponse.json({ error: 'Invalid session id' }, { status: 400 });
    }

    const ownedSession = await getOwnedSession({
      payload: scope.payload,
      sessionId,
      instructorId: scope.instructorId,
      depth: 0,
    });
    if (!ownedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const fileCandidates = [...formData.getAll('files'), ...formData.getAll('file')];
    const files = fileCandidates.filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    }

    const uploadedIds: number[] = [];
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      if (!buffer.length) continue;

      const created = await scope.payload.create({
        collection: 'media',
        data: {
          alt: file.name,
        },
        file: {
          data: buffer,
          mimetype: file.type || 'application/octet-stream',
          name: file.name || `session-material-${Date.now()}`,
          size: buffer.length,
        },
        overrideAccess: true,
      });

      const mediaId = relationToId(created.id);
      if (mediaId) uploadedIds.push(mediaId);
    }

    if (!uploadedIds.length) {
      return NextResponse.json({ error: 'No valid files were uploaded' }, { status: 400 });
    }

    const existingIds = Array.isArray(ownedSession.materials)
      ? ownedSession.materials
          .map((value) => relationToId(value))
          .filter((value): value is number => value !== null)
      : [];
    const nextIds = uniqueIds([...existingIds, ...uploadedIds]);

    await scope.payload.update({
      collection: 'sessions',
      id: sessionId,
      data: { materials: nextIds },
      overrideAccess: true,
    });

    const updated = await getOwnedSession({
      payload: scope.payload,
      sessionId,
      instructorId: scope.instructorId,
      depth: 1,
    });

    return NextResponse.json({
      sessionId: String(sessionId),
      uploadedIds: uploadedIds.map(String),
      materials: sessionMaterials(updated),
    });
  } catch (error) {
    console.error('[api/instructor/sessions/:id/materials][POST]', error);
    return NextResponse.json({ error: 'Failed to upload session materials' }, { status: 500 });
  }
}
