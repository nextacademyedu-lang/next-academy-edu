import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type InstructorLike = {
  id: number | string;
  slug?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

type ConsultationTypeLike = {
  id: number | string;
  title?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  durationMinutes?: number | null;
  price?: number | null;
  currency?: string | null;
  meetingType?: string | null;
  isActive?: boolean | null;
};

type ConsultationSlotLike = {
  id: number | string;
  consultationType?: number | { id?: number | string } | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: string | null;
};

function parseSlotStartDate(dateValue?: string | null, startTime?: string | null): Date | null {
  if (!dateValue) return null;
  const base = new Date(dateValue);
  if (Number.isNaN(base.getTime())) return null;

  const timeRaw = (startTime || '').trim();
  if (!timeRaw) return base;

  const match12h = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(timeRaw);
  if (match12h) {
    let hour = Number(match12h[1]);
    const minute = Number(match12h[2]);
    const period = match12h[3].toUpperCase();
    if (Number.isFinite(hour) && Number.isFinite(minute) && hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      base.setHours(hour, minute, 0, 0);
      return base;
    }
  }

  const match24h = /^(\d{1,2}):(\d{2})$/.exec(timeRaw);
  if (match24h) {
    const hour = Number(match24h[1]);
    const minute = Number(match24h[2]);
    if (Number.isFinite(hour) && Number.isFinite(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      base.setHours(hour, minute, 0, 0);
      return base;
    }
  }

  return base;
}

function relationToId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const rawId = (value as { id?: unknown }).id;
    if (typeof rawId === 'number' && Number.isFinite(rawId)) return rawId;
    if (typeof rawId === 'string') {
      const parsed = Number(rawId);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

function parsePositiveInt(input: string | null, fallback: number, max: number): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

export async function GET(req: NextRequest) {
  try {
    const instructorParam = req.nextUrl.searchParams.get('instructor')?.trim() || '';
    if (!instructorParam) {
      return NextResponse.json({ error: 'instructor query parameter is required' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const typeLimit = parsePositiveInt(req.nextUrl.searchParams.get('typesLimit'), 50, 100);
    const slotLimit = parsePositiveInt(req.nextUrl.searchParams.get('slotsLimit'), 300, 500);

    const instructorResult = await payload.find({
      collection: 'instructors',
      where: {
        or: [{ slug: { equals: instructorParam } }, { id: { equals: instructorParam } }],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      req,
    });

    const instructor = instructorResult.docs[0] as InstructorLike | undefined;
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    const instructorId = relationToId(instructor.id);
    if (!instructorId) {
      return NextResponse.json({ error: 'Invalid instructor id' }, { status: 500 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const now = new Date();

    const [typesResult, slotsResult] = await Promise.all([
      payload.find({
        collection: 'consultation-types',
        where: {
          and: [{ instructor: { equals: instructorId } }, { isActive: { equals: true } }],
        },
        depth: 0,
        sort: '-updatedAt',
        limit: typeLimit,
        overrideAccess: true,
        req,
      }),
      payload.find({
        collection: 'consultation-slots',
        where: {
          and: [
            { instructor: { equals: instructorId } },
            { status: { equals: 'available' } },
            { date: { greater_than_equal: todayStart.toISOString() } },
          ],
        },
        depth: 0,
        sort: 'date',
        limit: slotLimit,
        overrideAccess: true,
        req,
      }),
    ]);

    const types = (typesResult.docs as ConsultationTypeLike[]).map((doc) => ({
      id: String(doc.id),
      title: doc.title || doc.titleEn || doc.titleAr || 'Consultation',
      titleAr: doc.titleAr || '',
      titleEn: doc.titleEn || '',
      durationMinutes: Number(doc.durationMinutes) || 30,
      price: Number(doc.price) || 0,
      currency: doc.currency || 'EGP',
      meetingType: doc.meetingType || 'online',
    }));

    const slots = (slotsResult.docs as ConsultationSlotLike[])
      .filter((slot) => {
        if (slot.status !== 'available') return false;
        const slotStart = parseSlotStartDate(slot.date, slot.startTime);
        return Boolean(slotStart && slotStart > now);
      })
      .map((slot) => ({
        id: String(slot.id),
        consultationTypeId: String(relationToId(slot.consultationType) || ''),
        date: slot.date || '',
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
      }))
      .filter((slot) => slot.consultationTypeId && slot.date && slot.startTime && slot.endTime);

    return NextResponse.json({
      instructor: {
        id: String(instructorId),
        slug: instructor.slug || '',
        name: `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || 'Instructor',
      },
      consultationTypes: types,
      availableSlots: slots,
    });
  } catch (error) {
    console.error('[api/consultation/public-options][GET]', error);
    return NextResponse.json({ error: 'Failed to load consultation options' }, { status: 500 });
  }
}
