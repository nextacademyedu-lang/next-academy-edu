import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type AuthUser = {
  role?: string | null;
  instructorId?: unknown;
};

type InstructorDocLike = {
  id: number | string;
  firstName?: string | null;
  lastName?: string | null;
  jobTitle?: string | null;
  tagline?: string | null;
  bioAr?: unknown;
  bioEn?: unknown;
  verificationStatus?: string | null;
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

function hasRichTextContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const root = (value as { root?: { children?: unknown[] } }).root;
  if (!root || !Array.isArray(root.children)) return false;

  for (const child of root.children) {
    if (!child || typeof child !== 'object') continue;
    const children = (child as { children?: Array<{ text?: unknown }> }).children;
    if (!Array.isArray(children)) continue;
    for (const textNode of children) {
      const text = typeof textNode?.text === 'string' ? textNode.text.trim() : '';
      if (text.length > 0) return true;
    }
  }

  return false;
}

function collectMissingFields(instructor: InstructorDocLike): string[] {
  const missing: string[] = [];
  if (!instructor.firstName?.trim()) missing.push('firstName');
  if (!instructor.lastName?.trim()) missing.push('lastName');
  if (!instructor.jobTitle?.trim()) missing.push('jobTitle');
  if (!instructor.tagline?.trim()) missing.push('tagline');
  if (!hasRichTextContent(instructor.bioAr) && !hasRichTextContent(instructor.bioEn)) {
    missing.push('bio');
  }
  return missing;
}

async function resolveInstructorContext(req: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = user as AuthUser | null;

  if (!authUser) return { error: 'Unauthorized', status: 401 as const };
  if (authUser.role !== 'instructor') return { error: 'Forbidden', status: 403 as const };

  const instructorId = relationToId(authUser.instructorId);
  if (!instructorId) return { error: 'No instructor profile linked to this account', status: 403 as const };

  return { payload, instructorId };
}

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveInstructorContext(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const instructor = (await scope.payload.findByID({
      collection: 'instructors',
      id: scope.instructorId,
      depth: 0,
      overrideAccess: true,
          })) as InstructorDocLike;

    if (instructor.verificationStatus === 'approved') {
      return NextResponse.json({
        submitted: false,
        message: 'Profile already approved',
        status: 'approved',
      });
    }

    const missingFields = collectMissingFields(instructor);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Profile is incomplete',
          missingFields,
        },
        { status: 400 },
      );
    }

    const updated = (await (scope.payload as any).update({
      collection: 'instructors',
      id: scope.instructorId,
      data: {
        verificationStatus: 'pending',
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
      context: { selfServiceInstructorProfile: true },
    } as any)) as { verificationStatus?: string | null };

    return NextResponse.json({
      submitted: true,
      status: updated.verificationStatus || 'pending',
      profile: updated,
    });
  } catch (error) {
    console.error('[api/instructor/profile/submit][POST]', error);
    return NextResponse.json({ error: 'Failed to submit profile for verification' }, { status: 500 });
  }
}
