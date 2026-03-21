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

// Must be logged in
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user);
};

// Admin role only
export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false;
  return user.role === 'admin';
};

// User can only access their own record; Admin can access all
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  return {
    id: {
      equals: user.id,
    },
  };
};

// Admin or Instructor role
export const isAdminOrInstructor: Access = ({ req: { user } }) => {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'instructor';
};

// Owner of the record (uses 'user' field) or Admin
export const isAdminOrOwner: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

  // Return a query constraint: Payload will filter to records where user field matches
  return {
    user: {
      equals: user.id,
    },
  };
};

// Owner based on a custom field name
export const isAdminOrOwnerByField = (fieldName: string): Access => {
  return ({ req: { user } }) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    return {
      [fieldName]: {
        equals: user.id,
      },
    };
  };
};

// Instructor can only access own records (matched by instructor relationship)
export const isAdminOrOwnInstructor: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

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
export const isAdminOrOwnerOrOwnInstructor: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

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
export const isAdminOrOwnInstructorForUpdate: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;

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
  if (user.role === 'admin') return true;

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
export const adminOnlyField: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin');
};
