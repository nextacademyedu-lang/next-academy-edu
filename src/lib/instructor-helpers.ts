import type { Instructor } from '@/payload-types';

/**
 * Extract instructor name(s) from a Program's `instructor` field.
 *
 * Since `instructor` is `hasMany`, it can be:
 *   - an array of Instructor objects
 *   - an array of numbers (IDs)
 *   - null / undefined
 *
 * Returns a joined string of instructor names, or a fallback.
 */
export function getInstructorNames(
  instructorField: unknown,
  fallback: string = '',
): string {
  if (!instructorField) return fallback;

  // hasMany always produces an array
  const items = Array.isArray(instructorField)
    ? instructorField
    : [instructorField]; // backwards compat with single value

  const names: string[] = [];
  for (const item of items) {
    if (item && typeof item === 'object' && 'firstName' in item) {
      const inst = item as Instructor;
      const name = `${inst.firstName ?? ''} ${inst.lastName ?? ''}`.trim();
      if (name) names.push(name);
    }
  }

  return names.length > 0 ? names.join(', ') : fallback;
}

/**
 * Extract the first populated Instructor object from a hasMany instructor field.
 */
export function getFirstInstructor(instructorField: unknown): Instructor | null {
  if (!instructorField) return null;

  const items = Array.isArray(instructorField)
    ? instructorField
    : [instructorField];

  for (const item of items) {
    if (item && typeof item === 'object' && 'firstName' in item) {
      return item as Instructor;
    }
  }
  return null;
}

/**
 * Extract all instructor IDs from a hasMany instructor field.
 */
export function getInstructorIds(instructorField: unknown): number[] {
  if (!instructorField) return [];

  const items = Array.isArray(instructorField)
    ? instructorField
    : [instructorField];

  const ids: number[] = [];
  for (const item of items) {
    if (typeof item === 'number') {
      ids.push(item);
    } else if (item && typeof item === 'object' && 'id' in item) {
      const id = (item as { id: number }).id;
      if (typeof id === 'number') ids.push(id);
    }
  }
  return ids;
}
