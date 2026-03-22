import type { Access, FieldAccess } from 'payload';

/**
 * Access Control Helpers for Payload CMS Collections
 *
 * Usage in collections:
 *   access: {
 *     read: isPublic,          // Anyone can read
 *     create: isAuthenticated, // Logged-in users
 *     update: isAdminOrSelf,   // Admin or own record
 *     delete: isAdmin,         // Admin only
 *   }
 */

// Anyone (no authentication required)
export const isPublic: Access = () => true;

type AccessUser = {
  id?: string | number;
  role?: string | null;
  email?: string | null;
  instructorId?: unknown;
};

function normalizeUserId(value: unknown): string | number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber)) return asNumber;
    return trimmed;
  }
  return null;
}

function parseConfiguredAdminEmails(): string[] {
  const raw = process.env.PAYLOAD_ADMIN_EMAIL || '';
  return raw
    .split(/[,\s;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: AccessUser | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const userEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : '';
  if (!userEmail) return false;

  const adminEmails = parseConfiguredAdminEmails();
  return adminEmails.includes(userEmail);
}

async function fetchPersistedUser(req: { user?: AccessUser | null; payload?: any }): Promise<AccessUser | null> {
  const userId = normalizeUserId(req.user?.id);
  if (!userId || !req.payload?.findByID) return null;

  try {
    const user = await req.payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
      overrideAccess: true,
    });
    return (user || null) as AccessUser | null;
  } catch {
    try {
      if (!req.payload?.find) return null;
      const fallback = await req.payload.find({
        collection: 'users',
        where: { id: { equals: userId } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
      });
      return ((fallback?.docs?.[0] as AccessUser | undefined) || null) as AccessUser | null;
    } catch {
      return null;
    }
  }
}

export async function isAdminRequest(req: { user?: AccessUser | null; payload?: any }): Promise<boolean> {
  if (isAdminUser(req.user)) return true;

  const persisted = await fetchPersistedUser(req);
  return isAdminUser(persisted);
}

// Must be logged in
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user);
};

// Admin role only
export const isAdmin: Access = async ({ req }) => {
  return isAdminRequest(req);
};

// User can only access their own record; Admin can access all
export const isAdminOrSelf: Access = async ({ req }) => {
  const { user } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;

  return {
    id: {
      equals: user.id,
    },
  };
};

// Admin or Instructor role
export const isAdminOrInstructor: Access = async ({ req }) => {
  const { user } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;
  return user.role === 'instructor';
};

// Owner of the record (uses 'user' field) or Admin
export const isAdminOrOwner: Access = async ({ req }) => {
  const { user } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;

  // Return a query constraint: Payload will filter to records where user field matches
  return {
    user: {
      equals: user.id,
    },
  };
};

// Owner based on a custom field name
export const isAdminOrOwnerByField = (fieldName: string): Access => {
  return async ({ req }) => {
    const { user } = req;
    if (!user) return false;
    if (await isAdminRequest(req)) return true;

    return {
      [fieldName]: {
        equals: user.id,
      },
    };
  };
};

// Instructor can only access own records (matched by instructor relationship)
export const isAdminOrOwnInstructor: Access = async ({ req }) => {
  const { user } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;

  if (user.role === 'instructor' && user.instructorId) {
    return {
      instructor: {
        equals: typeof user.instructorId === 'object' ? user.instructorId.id : user.instructorId,
      },
    };
  }

  return false;
};

// User can read own records (by user field), instructor can read own records (by instructor field), admin can read all
export const isAdminOrOwnerOrOwnInstructor: Access = async ({ req }) => {
  const { user } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;

  if (user.role === 'instructor' && user.instructorId) {
    const instructorId =
      typeof user.instructorId === 'object' ? user.instructorId.id : user.instructorId;
    const clause: Record<string, { equals: unknown }> = {
      instructor: { equals: instructorId },
    };
    return clause;
  }

  const clause: Record<string, { equals: unknown }> = {
    user: { equals: user.id },
  };
  return clause;
};

// Instructor can update own records (matched by instructor field), admin can update all
export const isAdminOrOwnInstructorForUpdate: Access = async ({ req }) => {
  const { user } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;

  if (user.role === 'instructor' && user.instructorId) {
    const instructorId =
      typeof user.instructorId === 'object' ? user.instructorId.id : user.instructorId;
    return {
      instructor: {
        equals: instructorId,
      },
    };
  }

  return false;
};

// B2B Manager can read records for users in same company
export const isAdminOrB2BManager: Access = async ({ req }) => {
  const { user, payload } = req;
  if (!user) return false;
  if (await isAdminRequest(req)) return true;

  if (user.role !== 'b2b_manager') return false;

  const profileResult = await payload.find({
    collection: 'user-profiles',
    where: { user: { equals: user.id } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });

  const profile = profileResult.docs[0] as { company?: unknown } | undefined;
  const companyId =
    typeof profile?.company === 'object' && profile?.company && 'id' in profile.company
      ? Number((profile.company as { id?: unknown }).id)
      : typeof profile?.company === 'number'
        ? profile.company
        : typeof profile?.company === 'string'
          ? Number(profile.company)
          : null;

  if (!companyId || !Number.isFinite(companyId)) return false;

  return {
    company: {
      equals: companyId,
    },
  };
};

// Field-level: Admin only
export const adminOnlyField: FieldAccess = async ({ req }) => {
  return isAdminRequest(req);
};
