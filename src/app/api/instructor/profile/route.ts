import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type AuthUser = {
  role?: string | null;
  instructorId?: unknown;
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

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveInstructorContext(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    let instructor = (await scope.payload.findByID({
      collection: 'instructors',
      id: scope.instructorId,
      depth: 1,
      overrideAccess: true,
      req,
    })) as {
      id: number | string;
      onboardingCompleted?: boolean | null;
      verificationStatus?: string | null;
      isActive?: boolean | null;
    };

    const isOnboardingCompleted = Boolean(instructor?.onboardingCompleted);
    const verificationStatus =
      typeof instructor?.verificationStatus === 'string'
        ? instructor.verificationStatus
        : null;

    if (isOnboardingCompleted && verificationStatus !== 'approved') {
      const approvedSubmission = await scope.payload.find({
        collection: 'instructor-program-submissions',
        where: {
          and: [
            { instructor: { equals: scope.instructorId } },
            { status: { equals: 'approved' } },
          ],
        },
        depth: 0,
        limit: 1,
        overrideAccess: true,
        req,
      });

      if (approvedSubmission.docs.length > 0) {
        instructor = (await scope.payload.update({
          collection: 'instructors',
          id: scope.instructorId,
          data: {
            verificationStatus: 'approved',
            isActive: true,
          },
          overrideAccess: true,
          req,
          context: { allowInstructorStatusSync: true },
        })) as typeof instructor;
      }
    }

    return NextResponse.json({ profile: instructor });
  } catch (error) {
    console.error('[api/instructor/profile][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch instructor profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const scope = await resolveInstructorContext(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    const textFields = ['firstName', 'lastName', 'jobTitle', 'tagline', 'linkedinUrl', 'twitterUrl'] as const;
    for (const field of textFields) {
      if (body[field] !== undefined) {
        data[field] = typeof body[field] === 'string' ? body[field].trim() : body[field];
      }
    }

    if (body.bioAr !== undefined) data.bioAr = body.bioAr;
    if (body.bioEn !== undefined) data.bioEn = body.bioEn;
    if (body.picture !== undefined) data.picture = body.picture;
    if (body.coverImage !== undefined) data.coverImage = body.coverImage;

    const current = (await scope.payload.findByID({
      collection: 'instructors',
      id: scope.instructorId,
      depth: 0,
      overrideAccess: true,
      req,
    })) as { verificationStatus?: string | null } | null;

    if (current?.verificationStatus === 'rejected') {
      data.verificationStatus = 'draft';
      data.rejectionReason = null;
      data.rejectedAt = null;
    }

    const updated = await scope.payload.update({
      collection: 'instructors',
      id: scope.instructorId,
      data,
      overrideAccess: true,
      req,
      context: { selfServiceInstructorProfile: true },
    });

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('[api/instructor/profile][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update instructor profile' }, { status: 500 });
  }
}
