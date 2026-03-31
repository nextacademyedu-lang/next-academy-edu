import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { authenticateRequestUser } from '@/lib/server-auth';
import { assertTrustedWriteRequest } from '@/lib/csrf';
import { createPaymobIntention, getPaymobCheckoutUrl, type CheckoutSession } from '@/lib/payment-api';

type ConsultationTypeDoc = {
  id: number | string;
  instructor?: number | string | { id?: number | string } | null;
  title?: string | null;
  titleAr?: string | null;
  titleEn?: string | null;
  price?: number | null;
  currency?: string | null;
};

type ConsultationSlotDoc = {
  id: number | string;
  consultationType?: number | string | { id?: number | string } | null;
  instructor?: number | string | { id?: number | string } | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  status?: 'available' | 'booked' | 'blocked' | 'cancelled' | null;
};

type ConsultationBookingDoc = {
  id: number | string;
  createdAt?: string | null;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | null;
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
    const nested = (value as { id?: unknown }).id;
    if (typeof nested === 'number' && Number.isFinite(nested)) return nested;
    if (typeof nested === 'string') {
      const parsed = Number(nested);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

function normalizeId(value: unknown): number | null {
  return relationToId(value);
}

function generateCode(prefix: string): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function resolveAppBaseUrl(req: NextRequest): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  return configured.endsWith('/') ? configured.slice(0, -1) : configured;
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function isPendingAndRecent(booking: ConsultationBookingDoc): boolean {
  if (booking.status !== 'pending' || booking.paymentStatus !== 'pending') return false;
  if (!booking.createdAt) return false;
  return booking.createdAt > minutesAgo(20);
}

export async function POST(req: NextRequest) {
  let rollbackPayload: Awaited<ReturnType<typeof getPayload>> | null = null;
  let rollbackReq: NextRequest | null = null;
  let rollbackBookingId: number | null = null;
  let rollbackSlotId: number | null = null;
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    const body = (await req.json().catch(() => null)) as {
      slotId?: unknown;
      method?: 'card' | 'wallet';
      locale?: 'ar' | 'en';
      instructorSlug?: string;
      userNotes?: string;
    } | null;

    const slotId = normalizeId(body?.slotId);
    const method = body?.method === 'wallet' ? 'wallet' : 'card';
    const locale = body?.locale === 'ar' ? 'ar' : 'en';
    const instructorSlug =
      typeof body?.instructorSlug === 'string' && body.instructorSlug.trim()
        ? body.instructorSlug.trim()
        : '';
    const userNotes =
      typeof body?.userNotes === 'string' && body.userNotes.trim()
        ? body.userNotes.trim()
        : undefined;

    if (!slotId) {
      return NextResponse.json({ error: 'slotId is required' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    rollbackPayload = payload;
    rollbackReq = req;
    const user = await authenticateRequestUser(payload, req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const slot = (await payload.findByID({
      collection: 'consultation-slots',
      id: slotId,
      depth: 1,
      overrideAccess: true,
      req,
    })) as ConsultationSlotDoc | null;

    const pendingForSlot = await payload.find({
      collection: 'consultation-bookings',
      where: {
        and: [
          { slot: { equals: slotId } },
          { status: { equals: 'pending' } },
          { paymentStatus: { equals: 'pending' } },
        ],
      },
      depth: 0,
      limit: 50,
      sort: '-createdAt',
      overrideAccess: true,
      req,
    });

    const pendingDocs = pendingForSlot.docs as ConsultationBookingDoc[];
    const hasRecentPending = pendingDocs.some(isPendingAndRecent);
    if (hasRecentPending) {
      return NextResponse.json(
        { error: 'This slot is currently reserved by another checkout attempt. Please choose another time.' },
        { status: 409 },
      );
    }

    const stalePending = pendingDocs.filter((doc) => !isPendingAndRecent(doc));
    if (stalePending.length > 0) {
      await Promise.all(
        stalePending.map((doc) =>
          payload.update({
            collection: 'consultation-bookings',
            id: doc.id,
            data: {
              status: 'cancelled',
              cancellationReason: 'Reservation timed out before payment completion',
            },
            overrideAccess: true,
            req,
          }),
        ),
      );
    }

    if (!slot) {
      return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    }

    if (slot.status === 'blocked' && !hasRecentPending) {
      await payload.update({
        collection: 'consultation-slots',
        id: slotId,
        data: { status: 'available' },
        overrideAccess: true,
        req,
      });
      slot.status = 'available';
    }

    if (slot.status !== 'available') {
      return NextResponse.json({ error: 'This slot is no longer available' }, { status: 409 });
    }

    const slotStart = parseSlotStartDate(slot.date, slot.startTime);
    if (!slotStart || slotStart <= new Date()) {
      return NextResponse.json({ error: 'This slot is no longer valid' }, { status: 409 });
    }

    const consultationTypeId = relationToId(slot.consultationType);
    const instructorId = relationToId(slot.instructor);
    if (!consultationTypeId || !instructorId) {
      return NextResponse.json({ error: 'Invalid slot configuration' }, { status: 500 });
    }

    const consultationType = (await payload.findByID({
      collection: 'consultation-types',
      id: consultationTypeId,
      depth: 0,
      overrideAccess: true,
      req,
    })) as ConsultationTypeDoc | null;

    if (!consultationType) {
      return NextResponse.json({ error: 'Consultation type not found' }, { status: 404 });
    }

    const amount = Number(consultationType.price) || 0;
    const booking = (await payload.create({
      collection: 'consultation-bookings',
      data: {
        bookingCode: generateCode('CB'),
        user: user.id,
        slot: slotId,
        consultationType: consultationTypeId,
        instructor: instructorId,
        status: 'pending',
        amount,
        paymentStatus: amount <= 0 ? 'paid' : 'pending',
        userNotes,
      },
      overrideAccess: true,
      req,
    })) as ConsultationBookingDoc & { id: number | string };
    rollbackBookingId = normalizeId(booking.id);

    if (amount <= 0) {
      await Promise.all([
        payload.update({
          collection: 'consultation-bookings',
          id: booking.id,
          data: {
            status: 'confirmed',
            paymentStatus: 'paid',
            transactionId: `FREE-${booking.id}-${Date.now()}`,
          },
          overrideAccess: true,
          req,
        }),
        payload.update({
          collection: 'consultation-slots',
          id: slotId,
          data: { status: 'booked' },
          overrideAccess: true,
          req,
        }),
      ]);

      return NextResponse.json({
        free: true,
        consultationBookingId: String(booking.id),
        redirectUrl: `/${locale}/contact?intent=consultation&payment=success&consultationBookingId=${encodeURIComponent(
          String(booking.id),
        )}${instructorSlug ? `&instructor=${encodeURIComponent(instructorSlug)}` : ''}`,
      });
    }

    await payload.update({
      collection: 'consultation-slots',
      id: slotId,
      data: { status: 'blocked' },
      overrideAccess: true,
      req,
    });
    rollbackSlotId = slotId;

    const appBaseUrl = resolveAppBaseUrl(req);
    const redirectParams = new URLSearchParams({
      locale,
      flow: 'consultation',
      consultationBookingId: String(booking.id),
    });
    if (instructorSlug) redirectParams.set('instructor', instructorSlug);

    const session: CheckoutSession = {
      bookingId: String(booking.id),
      paymentId: String(booking.id),
      method,
      amount,
      programTitle:
        consultationType.title ||
        consultationType.titleEn ||
        consultationType.titleAr ||
        'Consultation Session',
      userEmail: user.email || '',
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Client',
      userPhone: (user as { phone?: string }).phone || '',
    };

    const intention = await createPaymobIntention(session, method, locale, {
      notificationUrl: `${appBaseUrl}/api/webhooks/paymob/consultation`,
      redirectionUrl: `${appBaseUrl}/api/webhooks/paymob/redirect?${redirectParams.toString()}`,
      extras: {
        flow: 'consultation',
        consultation_booking_id: String(booking.id),
      },
      specialReference: String(booking.id),
      itemName:
        consultationType.title ||
        consultationType.titleEn ||
        consultationType.titleAr ||
        'Consultation Session',
    });

    return NextResponse.json({
      consultationBookingId: String(booking.id),
      redirectUrl: getPaymobCheckoutUrl(intention.client_secret),
    });
  } catch (error) {
    if (rollbackPayload && rollbackReq && rollbackBookingId && rollbackSlotId) {
      try {
        await Promise.all([
          rollbackPayload.update({
            collection: 'consultation-bookings',
            id: rollbackBookingId,
            data: {
              status: 'cancelled',
              cancellationReason: 'Checkout initialization failed',
            },
            overrideAccess: true,
            req: rollbackReq,
          }),
          rollbackPayload.update({
            collection: 'consultation-slots',
            id: rollbackSlotId,
            data: { status: 'available' },
            overrideAccess: true,
            req: rollbackReq,
          }),
        ]);
      } catch (rollbackError) {
        console.error('[api/consultation/checkout][POST] rollback failed', rollbackError);
      }
    }
    console.error('[api/consultation/checkout][POST]', error);
    return NextResponse.json({ error: 'Failed to initiate consultation checkout' }, { status: 500 });
  }
}
