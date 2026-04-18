import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

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

function normalizeRecordingUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
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

async function getOwnedSession(
  payload: Awaited<ReturnType<typeof getPayload>>,
  req: NextRequest,
  sessionId: number,
  instructorId: number,
) {
  const result = await payload.find({
    collection: 'sessions',
    where: {
      and: [{ id: { equals: sessionId } }, { instructor: { equals: instructorId } }],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });

  return result.docs[0] as { id: number | string; recordingUrl?: string | null } | undefined;
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

    const ownedSession = await getOwnedSession(scope.payload, req, sessionId, scope.instructorId);
    if (!ownedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const body = (await req.json().catch(() => null)) as { recordingUrl?: unknown } | null;
    const hasRecordingUrlField = body && Object.prototype.hasOwnProperty.call(body, 'recordingUrl');
    if (!body || !hasRecordingUrlField) {
      return NextResponse.json({ error: 'recordingUrl field is required' }, { status: 400 });
    }

    const normalized = normalizeRecordingUrl(body.recordingUrl);
    if (body.recordingUrl && !normalized) {
      return NextResponse.json({ error: 'recordingUrl must be a valid http/https URL' }, { status: 400 });
    }

    const updated = await scope.payload.update({
      collection: 'sessions',
      id: sessionId,
      data: { recordingUrl: normalized },
      overrideAccess: true,
    });

    return NextResponse.json({
      sessionId: String(sessionId),
      recordingUrl: (updated as { recordingUrl?: string | null }).recordingUrl || null,
    });
  } catch (error) {
    console.error('[api/instructor/sessions/:id/recording][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update recording URL' }, { status: 500 });
  }
}
