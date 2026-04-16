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

async function ensureProgramRounds(params: { payload: any; req: unknown; program: ProgramLike }) {
  const { payload, req, program } = params;
  if (!program.id) return;

  const targetCount = normalizeRoundsCount(program.roundsCount);
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

  const programTitle = (program.titleEn || program.titleAr || 'Program').trim();
  for (let roundNumber = 1; roundNumber <= targetCount; roundNumber += 1) {
    if (existingRoundNumbers.has(roundNumber)) continue;

    const { startDate, endDate } = buildRoundPlaceholderWindow(roundNumber);

    await payload.create({
      collection: 'rounds',
      data: {
        program: program.id,
        roundNumber,
        title: `${programTitle} - Round ${roundNumber}`,
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
        const rounds = await req.payload.find({
          collection: 'rounds',
          where: { program: { equals: id } },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          req,
        });
        for (const r of rounds.docs) {
          await req.payload.delete({ collection: 'rounds', id: (r as { id: string | number }).id, overrideAccess: true, req });
        }
        const reviews = await req.payload.find({
          collection: 'reviews',
          where: { program: { equals: id } },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          req,
        });
        for (const r of reviews.docs) {
          await req.payload.delete({ collection: 'reviews', id: (r as { id: string | number }).id, overrideAccess: true, req });
        }
        const certs = await req.payload.find({
          collection: 'certificates',
          where: { program: { equals: id } },
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          req,
        });
        for (const c of certs.docs) {
          await req.payload.delete({ collection: 'certificates', id: (c as { id: string | number }).id, overrideAccess: true, req });
        }
      },
    ],
    afterChange: [
      async ({ req, doc }) => {
        await ensureProgramRounds({
          payload: req.payload,
          req,
          program: doc as any,
        });
      },
    ],
  },

  fields: [
    {
      type: 'tabs',
      tabs: [
        /* ── Tab 1: General ─────────────────────────────────────── */
        {
          label: 'General',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Workshop', value: 'workshop' },
                { label: 'Course', value: 'course' },
                { label: 'Webinar', value: 'webinar' },
                { label: 'Camp', value: 'camp' },
              ],
              required: true,
            },
            { name: 'titleAr', type: 'text', required: true },
            { name: 'titleEn', type: 'text' },
            { name: 'slug', type: 'text', required: true, unique: true },
            { name: 'isFeatured', type: 'checkbox', defaultValue: false },
            { name: 'isActive', type: 'checkbox', defaultValue: true, admin: { description: 'Controls whether this program is visible on the website' } },
          ],
        },

        /* ── Tab 2: Content ─────────────────────────────────────── */
        {
          label: 'Content',
          fields: [
            { name: 'shortDescriptionAr', type: 'textarea' },
            { name: 'shortDescriptionEn', type: 'textarea' },
            { name: 'descriptionAr', type: 'richText' },
            { name: 'descriptionEn', type: 'richText' },
            { name: 'thumbnail', type: 'upload', relationTo: 'media', admin: { description: 'Small preview image used in cards and listings' } },
            { name: 'coverImage', type: 'upload', relationTo: 'media', admin: { description: 'Large banner image displayed on the program detail page' } },
            { name: 'category', type: 'relationship', relationTo: 'categories' },
          ],
        },

        /* ── Tab 3: Educational ─────────────────────────────────── */
        {
          label: 'Educational',
          fields: [
            { name: 'objectives', type: 'array', fields: [{ name: 'item', type: 'text' }] },
            { name: 'requirements', type: 'array', fields: [{ name: 'item', type: 'text' }], admin: { description: 'Prerequisites learners should meet before enrolling' } },
            {
              name: 'roundsCount',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Total rounds planned. Missing rounds are auto-created as drafts.' },
            },
            { name: 'sessionsCount', type: 'number', admin: { description: 'Number of sessions per round' } },
            { name: 'level', type: 'select', options: ['beginner', 'intermediate', 'advanced'], admin: { description: 'Target skill level for the learner' } },
            { name: 'durationHours', type: 'number', admin: { description: 'Total duration in hours across all sessions' } },
            {
              name: 'language',
              type: 'select',
              options: ['ar', 'en', 'both'],
              defaultValue: 'ar',
              admin: { description: 'Language the program is delivered in' },
            },
            { name: 'targetAudience', type: 'array', fields: [{ name: 'item', type: 'text' }], admin: { description: 'Who this program is designed for' } },
          ],
        },

        /* ── Tab 4: SEO ─────────────────────────────────────────── */
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text' },
            { name: 'seoDescription', type: 'textarea' },
            { name: 'seoKeywords', type: 'array', fields: [{ name: 'keyword', type: 'text' }] },
          ],
        },

        /* ── Tab 5: Settings ────────────────────────────────────── */
        {
          label: 'Settings',
          fields: [
            { name: 'instructor', type: 'relationship', relationTo: 'instructors' },
            { name: 'tags', type: 'relationship', relationTo: 'tags', hasMany: true },
            {
              name: 'featuredPriority',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Controls ordering in featured cards (lower appears first)' },
            },
            /* ── Stats (read-only) ───────────────────────────────── */
            { name: 'learnersCount', type: 'number', defaultValue: 0, admin: { readOnly: true, description: 'Auto-calculated from enrollments' } },
            { name: 'viewCount', type: 'number', defaultValue: 0, admin: { readOnly: true, description: 'Auto-tracked page views' } },
            { name: 'averageRating', type: 'number', defaultValue: 0, admin: { readOnly: true } },
            { name: 'reviewCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
          ],
        },
      ],
    },
  ],
};
