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
      typeId?: unknown;
      slot?: string;
      method?: 'card' | 'wallet';
      locale?: 'ar' | 'en';
      instructorSlug?: string;
      userNotes?: string;
    } | null;

    const slotId = normalizeId(body?.slotId);
    const typeId = normalizeId(body?.typeId);
    const slotStr = body?.slot;
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

    if (!slotId && (!typeId || !slotStr)) {
      return NextResponse.json({ error: 'slotId or typeId+slot is required' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    rollbackPayload = payload;
    rollbackReq = req;
    const user = await authenticateRequestUser(payload, req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let consultationTypeId: number | null = null;
    let instructorId: number | null = null;
    let bookingDate: string | undefined;
    let startTime: string | undefined;
    let endTime: string | undefined;
    let consultationType: ConsultationTypeDoc | null = null;
    let legacySlot: ConsultationSlotDoc | null = null;

    if (slotId) {
      legacySlot = (await payload.findByID({
        collection: 'consultation-slots',
        id: slotId,
        depth: 1,
        overrideAccess: true,
        req,
      })) as ConsultationSlotDoc | null;

      if (!legacySlot) {
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
      }

      if (legacySlot.status !== 'available') {
        const checkPending = await payload.find({
          collection: 'consultation-bookings',
          where: {
            and: [
              { slot: { equals: slotId } },
              { status: { equals: 'pending' } },
              { paymentStatus: { equals: 'pending' } },
            ],
          },
          depth: 0,
          limit: 1,
          sort: '-createdAt',
          overrideAccess: true,
          req,
        });

        if (checkPending.docs.length > 0 && isPendingAndRecent(checkPending.docs[0] as ConsultationBookingDoc)) {
          return NextResponse.json({ error: 'This slot is currently reserved by another checkout attempt.' }, { status: 409 });
        }
      }

      const slotStart = parseSlotStartDate(legacySlot.date, legacySlot.startTime);
      if (!slotStart || slotStart <= new Date()) {
        return NextResponse.json({ error: 'This slot is no longer valid' }, { status: 409 });
      }

      consultationTypeId = relationToId(legacySlot.consultationType);
      instructorId = relationToId(legacySlot.instructor);
      
      if (consultationTypeId) {
        consultationType = (await payload.findByID({
          collection: 'consultation-types',
          id: consultationTypeId,
          depth: 0,
          overrideAccess: true,
          req,
        })) as ConsultationTypeDoc | null;
      }
    } else {
      consultationTypeId = typeId;
      if (consultationTypeId) {
        consultationType = (await payload.findByID({
          collection: 'consultation-types',
          id: consultationTypeId,
          depth: 0,
          overrideAccess: true,
          req,
        })) as ConsultationTypeDoc | null;
      }
      
      if (!consultationType) {
        return NextResponse.json({ error: 'Consultation type not found' }, { status: 404 });
      }

      instructorId = relationToId(consultationType.instructor);
      if (slotStr) {
        const d = new Date(slotStr);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: 'Invalid slot time format' }, { status: 400 });
        }
        bookingDate = d.toISOString();
        
        const pad = (n: number) => n.toString().padStart(2, '0');
        startTime = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
        
        // Calculate end time using duration
        const duration = (consultationType as any).durationMinutes || 60;
        const e = new Date(d.getTime() + duration * 60000);
        endTime = `${pad(e.getUTCHours())}:${pad(e.getUTCMinutes())}`;
      }

      // Check for clashing recent pending active bookings at exactly the same time,
      // handled effectively enough by the BookingEngine in real time, but a safety net:
      const existingAtTime = await payload.find({
        collection: 'consultation-bookings',
        where: {
          and: [
            { instructor: { equals: instructorId } },
            { bookingDate: { equals: bookingDate } },
          ],
        },
        depth: 0,
        overrideAccess: true,
        req,
      });

      const hasRecentPendingOrConfirmed = existingAtTime.docs.some((doc: any) => {
        if (doc.status === 'cancelled' || doc.paymentStatus === 'refunded') return false;
        if (doc.status === 'pending' && doc.paymentStatus === 'pending') {
          return doc.createdAt && doc.createdAt > minutesAgo(20);
        }
        return true;
      });

      if (hasRecentPendingOrConfirmed) {
        return NextResponse.json({ error: 'This time slot was just booked or reserved by someone else.' }, { status: 409 });
      }
    }

    if (!consultationTypeId || !instructorId || !consultationType) {
      return NextResponse.json({ error: 'Invalid slot or type configuration' }, { status: 500 });
    }

    const amount = Number(consultationType.price) || 0;
    const booking = (await payload.create({
      collection: 'consultation-bookings',
      data: {
        bookingCode: generateCode('CB'),
        user: user.id,
        slot: slotId || null,
        consultationType: consultationTypeId,
        instructor: instructorId,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime,
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
      if (slotId) {
        await payload.update({
          collection: 'consultation-slots',
          id: slotId,
          data: { status: 'booked' },
          overrideAccess: true,
          req,
        });
      }

      return NextResponse.json({
        free: true,
        consultationBookingId: String(booking.id),
        redirectUrl: `/${locale}/contact?intent=consultation&payment=success&consultationBookingId=${encodeURIComponent(
          String(booking.id),
        )}${instructorSlug ? `&instructor=${encodeURIComponent(instructorSlug)}` : ''}`,
      });
    }

    if (slotId) {
      await payload.update({
        collection: 'consultation-slots',
        id: slotId,
        data: { status: 'blocked' },
        overrideAccess: true,
        req,
      });
      rollbackSlotId = slotId;
    }

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
    if (rollbackPayload && rollbackReq && rollbackBookingId) {
      try {
        const promises: Promise<any>[] = [
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
        ];
        
        if (rollbackSlotId) {
          promises.push(
            rollbackPayload.update({
              collection: 'consultation-slots',
              id: rollbackSlotId,
              data: { status: 'available' },
              overrideAccess: true,
              req: rollbackReq,
            })
          );
        }

        await Promise.all(promises);
      } catch (rollbackError) {
        console.error('[api/consultation/checkout][POST] rollback failed', rollbackError);
      }
    }
    console.error('[api/consultation/checkout][POST]', error);
    return NextResponse.json({ error: 'Failed to initiate consultation checkout' }, { status: 500 });
  }
}
