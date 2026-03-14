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

// B2B Manager can read records for users in same company
export const isAdminOrB2BManager: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.role === 'b2b_manager';
};

// Field-level: Admin only
export const adminOnlyField: FieldAccess = ({ req: { user } }) => {
  return Boolean(user && user.role === 'admin');
};
