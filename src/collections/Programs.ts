import type { CollectionConfig } from 'payload';
import { isAdmin, isPublic } from '../lib/access-control.ts';

type ProgramLike = {
  id?: number | string;
  titleAr?: string | null;
  titleEn?: string | null;
  roundsCount?: number | null;
};

function normalizeRoundsCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.min(200, Math.floor(value)));
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const asNumber = Number(value);
    if (Number.isFinite(asNumber)) {
      return Math.max(0, Math.min(200, Math.floor(asNumber)));
    }
  }
  return 0;
}

function buildRoundPlaceholderWindow(roundNumber: number): { startDate: string; endDate: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + (roundNumber - 1), 1, 9, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + (roundNumber + 1), 1, 17, 0, 0, 0));
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

async function ensureProgramRounds(params: { payload: any; req: unknown; program: ProgramLike & { type?: string } }) {
  const { payload, req, program } = params;
  if (!program.id) return;

  // Events auto-create exactly 1 round (ignore roundsCount)
  const isEvent = program.type === 'event';
  const targetCount = isEvent ? 1 : normalizeRoundsCount(program.roundsCount);
  if (targetCount <= 0) return;

  const existingRounds = await payload.find({
    collection: 'rounds',
    where: { program: { equals: program.id } },
    depth: 0,
    limit: 500,
    sort: 'roundNumber',
    overrideAccess: true,
    req: req as any,
  });

  const existingRoundNumbers = new Set<number>();
  for (const round of existingRounds.docs as Array<{ roundNumber?: number | null }>) {
    if (typeof round.roundNumber === 'number' && Number.isFinite(round.roundNumber)) {
      existingRoundNumbers.add(round.roundNumber);
    }
  }

  // For events, skip if any round already exists
  if (isEvent && existingRoundNumbers.size > 0) return;

  const programTitle = (program.titleEn || program.titleAr || 'Program').trim();
  for (let roundNumber = 1; roundNumber <= targetCount; roundNumber += 1) {
    if (existingRoundNumbers.has(roundNumber)) continue;

    const { startDate, endDate } = buildRoundPlaceholderWindow(roundNumber);

    await payload.create({
      collection: 'rounds',
      data: {
        program: program.id,
        roundNumber,
        title: isEvent ? programTitle : `${programTitle} - Round ${roundNumber}`,
        startDate,
        endDate,
        timezone: 'Africa/Cairo',
        locationType: 'online',
        maxCapacity: 100,
        price: 0,
        currency: 'EGP',
        status: 'draft',
        isActive: true,
      },
      overrideAccess: true,
      req: req as any,
    });
  }
}

/* ── Condition helpers for admin field visibility ──────────────── */
const isEducational = (data: Record<string, unknown>) =>
  !['event', 'retreat'].includes(data?.type as string);

const isEventLike = (data: Record<string, unknown>) =>
  ['event', 'retreat', 'camp'].includes(data?.type as string);

const isRetreatOrCamp = (data: Record<string, unknown>) =>
  ['retreat', 'camp'].includes(data?.type as string);

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: { useAsTitle: 'titleAr' },
  access: {
    read: isPublic,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        // Delete all rounds first (each round's beforeDelete will cascade to its sessions).
        const existingRounds = await req.payload.find({
          collection: 'rounds',
          where: { program: { equals: id } },
          depth: 0,
          limit: 500,
          overrideAccess: true,
          req,
        });
        for (const round of existingRounds.docs) {
          await req.payload.delete({
            collection: 'rounds',
            id: (round as { id: number | string }).id,
            overrideAccess: true,
            req,
          });
        }
        // Clean up reviews referencing this program.
        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { program: { equals: id } },
          depth: 0,
          limit: 500,
          overrideAccess: true,
          req,
        });
        for (const review of reviews.docs) {
          await req.payload.delete({
            collection: 'reviews',
            id: (review as { id: number | string }).id,
            overrideAccess: true,
            req,
          });
        }
        // Clean up certificates referencing this program.
        const certificates = await req.payload.find({
          collection: 'certificates',
          where: { program: { equals: id } },
          depth: 0,
          limit: 500,
          overrideAccess: true,
          req,
        });
        for (const cert of certificates.docs) {
          await req.payload.delete({
            collection: 'certificates',
            id: (cert as { id: number | string }).id,
            overrideAccess: true,
            req,
          });
        }
      },

    ],
    afterChange: [
      async ({ req, doc }) => {
        await ensureProgramRounds({
          payload: req.payload,
          req,
          program: doc as ProgramLike & { type?: string },
        });
      },
    ],
  },
  fields: [
    /* ── Core fields (all types) ─────────────────────────────── */
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Workshop', value: 'workshop' },
        { label: 'Course', value: 'course' },
        { label: 'Webinar', value: 'webinar' },
        { label: 'Event', value: 'event' },
        { label: 'Camp', value: 'camp' },
        { label: 'Retreat', value: 'retreat' },
        { label: 'Corporate Training', value: 'corporate_training' },
      ],
      required: true,
    },
    { name: 'titleAr', type: 'text', required: true },
    { name: 'titleEn', type: 'text' },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'descriptionAr', type: 'richText' },
    { name: 'descriptionEn', type: 'richText' },
    { name: 'shortDescriptionAr', type: 'textarea' },
    { name: 'shortDescriptionEn', type: 'textarea' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'instructor', type: 'relationship', relationTo: 'instructors', hasMany: true },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    { name: 'durationHours', type: 'number' },
    {
      name: 'language',
      type: 'select',
      options: ['ar', 'en', 'both'],
      defaultValue: 'ar',
    },
    { name: 'targetAudience', type: 'array', fields: [{ name: 'item', type: 'text' }] },
    { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
    { name: 'isFeatured', type: 'checkbox', defaultValue: false },
    {
      name: 'featuredPriority',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Controls ordering in featured cards (lower appears first)',
      },
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },

    /* ── Educational fields (course/workshop/webinar/camp/corporate) ── */
    {
      name: 'roundsCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description:
          'Total rounds planned. Missing rounds are auto-created as drafts. Events get 1 round automatically.',
        condition: (data) => (data?.type as string) !== 'event',
      },
    },
    {
      name: 'sessionsCount',
      type: 'number',
      admin: {
        condition: (data) => (data?.type as string) !== 'event',
      },
    },
    {
      name: 'level',
      type: 'select',
      options: ['beginner', 'intermediate', 'advanced'],
      admin: {
        condition: (data) => isEducational(data as Record<string, unknown>),
      },
    },
    {
      name: 'objectives',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: {
        condition: (data) => (data?.type as string) !== 'event',
      },
    },
    {
      name: 'requirements',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: {
        condition: (data) => (data?.type as string) !== 'event',
      },
    },

    /* ── Speakers / Hosts (event/retreat/camp) ───────────────── */
    {
      name: 'speakers',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'title', type: 'text' },
        { name: 'photo', type: 'upload', relationTo: 'media' },
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Speaker', value: 'speaker' },
            { label: 'Host', value: 'host' },
            { label: 'Panelist', value: 'panelist' },
            { label: 'Moderator', value: 'moderator' },
          ],
          defaultValue: 'speaker',
        },
      ],
      admin: {
        description: 'Speakers, hosts, panelists for this program.',
        condition: (data) => isEventLike(data as Record<string, unknown>),
      },
    },

    /* ── Sponsors & Partners (event/retreat/camp/corporate) ─── */
    {
      name: 'sponsors',
      type: 'relationship',
      relationTo: 'partners',
      hasMany: true,
      admin: {
        description: 'Select sponsors/partners from the Partners collection.',
        condition: (data) =>
          ['event', 'retreat', 'camp', 'corporate_training'].includes(data?.type as string),
      },
    },

    /* ── Event-specific: Agenda ──────────────────────────────── */
    {
      name: 'agenda',
      type: 'array',
      fields: [
        { name: 'time', type: 'text', required: true },
        { name: 'titleAr', type: 'text', required: true },
        { name: 'titleEn', type: 'text' },
        { name: 'descriptionAr', type: 'textarea' },
        { name: 'speaker', type: 'text' },
      ],
      admin: {
        description: 'Event agenda / schedule.',
        condition: (data) => (data?.type as string) === 'event',
      },
    },

    /* ── Registration Deadline (event/retreat/camp) ──────────── */
    {
      name: 'registrationDeadline',
      type: 'date',
      admin: {
        description: 'Last date to register for this program.',
        condition: (data) => isEventLike(data as Record<string, unknown>),
      },
    },

    /* ── Retreat-specific: Itinerary ─────────────────────────── */
    {
      name: 'itinerary',
      type: 'array',
      fields: [
        { name: 'dayNumber', type: 'number', required: true },
        { name: 'titleAr', type: 'text', required: true },
        { name: 'titleEn', type: 'text' },
        {
          name: 'activities',
          type: 'array',
          fields: [
            { name: 'time', type: 'text' },
            { name: 'activityAr', type: 'text', required: true },
            { name: 'activityEn', type: 'text' },
          ],
        },
      ],
      admin: {
        description: 'Day-by-day itinerary for retreats.',
        condition: (data) => (data?.type as string) === 'retreat',
      },
    },

    /* ── Includes / Excludes (retreat/camp) ──────────────────── */
    {
      name: 'includes',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: {
        description: "What's included (accommodation, meals, transport, etc.)",
        condition: (data) => isRetreatOrCamp(data as Record<string, unknown>),
      },
    },
    {
      name: 'excludes',
      type: 'array',
      fields: [{ name: 'item', type: 'text' }],
      admin: {
        description: "What's NOT included.",
        condition: (data) => isRetreatOrCamp(data as Record<string, unknown>),
      },
    },

    /* ── Stats (read-only, all types) ────────────────────────── */
    {
      name: 'learnersCount',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    { name: 'viewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'averageRating', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'reviewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },

    /* ── SEO (all types) ─────────────────────────────────────── */
    { name: 'seoTitle', type: 'text' },
    { name: 'seoDescription', type: 'textarea' },
    { name: 'seoKeywords', type: 'array', fields: [{ name: 'keyword', type: 'text' }] },
  ],
};
