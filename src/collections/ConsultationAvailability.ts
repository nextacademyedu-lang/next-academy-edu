import type { CollectionConfig } from 'payload';
import { isPublic, isAdminOrOwnInstructor } from '../lib/access-control.ts';

const DAY_TO_INDEX: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const INDEX_TO_DAY = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

type AvailabilityLike = {
  dayOfWeek?: string | null;
  dayIndex?: number | null;
};

function normalizeDayIndex(value: unknown): 0 | 1 | 2 | 3 | 4 | 5 | 6 | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) return null;
  return parsed as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export const ConsultationAvailability: CollectionConfig = {
  slug: 'consultation-availability',
  admin: { useAsTitle: 'dayOfWeek' },
  access: {
    read: isPublic,
    create: isAdminOrOwnInstructor,
    update: isAdminOrOwnInstructor,
    delete: isAdminOrOwnInstructor,
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const next = { ...(data || {}) } as AvailabilityLike;
        const prev = (originalDoc || {}) as AvailabilityLike;

        const explicitDayIndex = normalizeDayIndex(next.dayIndex);
        const explicitDayOfWeek =
          typeof next.dayOfWeek === 'string' ? next.dayOfWeek.toLowerCase() : undefined;

        const resolvedDayOfWeek =
          explicitDayOfWeek && explicitDayOfWeek in DAY_TO_INDEX
            ? explicitDayOfWeek
            : explicitDayIndex !== null
              ? INDEX_TO_DAY[explicitDayIndex]
              : typeof prev.dayOfWeek === 'string' && prev.dayOfWeek in DAY_TO_INDEX
                ? prev.dayOfWeek
                : undefined;

        const resolvedDayIndex =
          explicitDayIndex !== null
            ? explicitDayIndex
            : resolvedDayOfWeek
              ? DAY_TO_INDEX[resolvedDayOfWeek]
              : normalizeDayIndex(prev.dayIndex);

        if (resolvedDayOfWeek) next.dayOfWeek = resolvedDayOfWeek;
        if (resolvedDayIndex !== null) next.dayIndex = resolvedDayIndex;

        return next;
      },
    ],
    afterRead: [
      ({ doc }) => {
        const current = (doc || {}) as AvailabilityLike;
        const dayOfWeek =
          typeof current.dayOfWeek === 'string' ? current.dayOfWeek.toLowerCase() : '';
        const fromDayOfWeek =
          dayOfWeek && dayOfWeek in DAY_TO_INDEX ? DAY_TO_INDEX[dayOfWeek] : null;
        const dayIndex = normalizeDayIndex(current.dayIndex) ?? fromDayOfWeek ?? 0;

        return {
          ...doc,
          dayIndex,
        };
      },
    ],
  },
  fields: [
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', required: true },
    {
      name: 'dayOfWeek',
      type: 'select',
      required: true,
      options: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    {
      name: 'dayIndex',
      type: 'number',
      min: 0,
      max: 6,
      admin: { description: 'Compatibility numeric day index (0=Sunday ... 6=Saturday).' },
    },
    { name: 'startTime', type: 'text', required: true },
    { name: 'endTime', type: 'text', required: true },
    { name: 'bufferMinutes', type: 'number', defaultValue: 15 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
};
