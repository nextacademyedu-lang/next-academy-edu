type RelationId = number | string;

type UserDocLike = {
  id: RelationId;
  email?: string | null;
  role?: string | null;
  emailVerified?: boolean | null;
  instructorId?: unknown;
};

type LinkResult = 'linked' | 'unchanged' | 'conflict' | 'skipped';
type InstructorLookupResult =
  | { status: 'none' }
  | { status: 'duplicate' }
  | { status: 'found'; instructorId: RelationId };

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function relationToId(value: unknown): RelationId | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const asNumber = Number(trimmed);
    return Number.isFinite(asNumber) ? asNumber : trimmed;
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const nested = (value as { id?: unknown }).id;
    if (typeof nested === 'number' && Number.isFinite(nested)) return nested;
    if (typeof nested === 'string') {
      const trimmed = nested.trim();
      if (!trimmed) return null;
      const asNumber = Number(trimmed);
      return Number.isFinite(asNumber) ? asNumber : trimmed;
    }
  }

  return null;
}

export async function findInstructorIdByEmail(params: {
  payload: any;
  req: any;
  normalizedEmail: string;
  source: string;
}): Promise<InstructorLookupResult> {
  const { payload, req, normalizedEmail, source } = params;

  const instructors = await payload.find({
    collection: 'instructors',
    where: { email: { equals: normalizedEmail } },
    depth: 0,
    limit: 2,
    overrideAccess: true,
    req,
  });

  if (!instructors.docs.length) return { status: 'none' };

  if (instructors.docs.length > 1) {
    console.warn(
      `[${source}] Multiple instructor profiles share email "${normalizedEmail}". Auto-link skipped.`,
    );
    return { status: 'duplicate' };
  }

  const instructorId = relationToId((instructors.docs[0] as { id?: unknown }).id);
  if (instructorId === null) return { status: 'none' };
  return { status: 'found', instructorId };
}

export async function linkUserToInstructor(params: {
  payload: any;
  req: any;
  user: UserDocLike;
  instructorId: RelationId;
  source: string;
}): Promise<LinkResult> {
  const { payload, req, user, instructorId, source } = params;

  if (!user?.id) return 'skipped';
  if (user.role === 'admin') return 'skipped';
  if (!user.emailVerified) return 'skipped';

  const currentInstructorId = relationToId(user.instructorId);
  const alreadyLinked =
    currentInstructorId !== null && String(currentInstructorId) === String(instructorId);
  const alreadyInstructor = user.role === 'instructor';
  if (alreadyLinked && alreadyInstructor) return 'unchanged';

  const linkedUsers = await payload.find({
    collection: 'users',
    where: { instructorId: { equals: instructorId } },
    depth: 0,
    limit: 10,
    overrideAccess: true,
    req,
  });

  const userIdStr = String(user.id);
  const conflict = linkedUsers.docs.find(
    (doc: { id?: unknown }) => String(relationToId(doc.id)) !== userIdStr,
  );

  if (conflict) {
    console.warn(
      `[${source}] Instructor #${instructorId} already linked to another user. Auto-link skipped for user #${user.id}.`,
    );
    return 'conflict';
  }

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      role: 'instructor',
      instructorId,
    },
    overrideAccess: true,
    req,
    context: {
      allowPrivilegedRoleWrite: true,
      skipInstructorAutoLink: true,
    },
  });

  console.info(
    `[${source}] Linked user #${user.id} to instructor #${instructorId} via email auto-link.`,
  );
  return 'linked';
}
