import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { verifyPaymobHmac } from '@/lib/payment-api';
import { createSessionEvent } from '@/lib/google-calendar';

type ConsultationBookingDoc = {
  id: number | string;
  amount?: number | null;
  slot?: number | string | { id?: number | string; date?: string; startTime?: string; endTime?: string } | null;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | null;
  paymentStatus?: 'pending' | 'paid' | 'refunded' | null;
  user?: { id?: string | number; email?: string } | string | number | null;
  instructor?: {
    id?: string | number;
    email?: string;
    googleRefreshToken?: string | null;
  } | string | number | null;
  bookingDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
};

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const obj = body.obj ?? body;
    const hmac = body.hmac as string;

    if (!hmac || !verifyPaymobHmac(obj, hmac)) {
      console.warn('[webhook/paymob/consultation] HMAC mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const success = obj.success === true || obj.success === 'true';
    const transactionId = String(obj.id || '');
    const amountCents = Number.parseInt(String(obj.amount_cents ?? '0'), 10);

    const consultationBookingRaw =
      obj.extras?.consultation_booking_id ??
      obj.extras?.booking_id ??
      obj.special_reference ??
      obj.order;
    const consultationBookingId = relationToId(consultationBookingRaw);
    if (!consultationBookingId) {
      console.warn('[webhook/paymob/consultation] Missing consultation booking id');
      return NextResponse.json({ received: true });
    }

    const payload = await getPayload({ config });
    const booking = (await payload.findByID({
      collection: 'consultation-bookings',
      id: consultationBookingId,
      depth: 2,
      overrideAccess: true,
      req: req as any,
    })) as ConsultationBookingDoc | null;

    if (!booking) {
      console.error('[webhook/paymob/consultation] Booking not found', consultationBookingId);
      return NextResponse.json({ received: true });
    }

    const slotId = relationToId(booking.slot);
    if (booking.paymentStatus === 'paid') {
      if (slotId) {
        await payload.update({
          collection: 'consultation-slots',
          id: slotId,
          data: { status: 'booked' },
          overrideAccess: true,
          req: req as any,
        });
      }
      return NextResponse.json({ received: true });
    }

    if (!success) {
      await payload.update({
        collection: 'consultation-bookings',
        id: consultationBookingId,
        data: {
          status: 'cancelled',
          paymentStatus: 'pending',
          cancellationReason: 'Payment was not completed',
        },
        overrideAccess: true,
        req: req as any,
      });

      if (slotId) {
        await payload.update({
          collection: 'consultation-slots',
          id: slotId,
          data: { status: 'available' },
          overrideAccess: true,
          req: req as any,
        });
      }

      return NextResponse.json({ received: true });
    }

    const expectedCents = Math.round((Number(booking.amount) || 0) * 100);
    if (amountCents < expectedCents - 1) {
      await payload.update({
        collection: 'consultation-bookings',
        id: consultationBookingId,
        data: {
          status: 'cancelled',
          paymentStatus: 'pending',
          cancellationReason: 'Received payment amount is lower than expected',
        },
        overrideAccess: true,
        req: req as any,
      });

      if (slotId) {
        await payload.update({
          collection: 'consultation-slots',
          id: slotId,
          data: { status: 'available' },
          overrideAccess: true,
          req: req as any,
        });
      }

      return NextResponse.json({ received: true });
    }

    // Create Google Calendar event
    let meetingUrl = '';
    const bookingDateRaw = typeof booking.slot === 'object' && booking.slot !== null && 'date' in booking.slot ? booking.slot.date : booking.bookingDate;
    const startTimeRaw = typeof booking.slot === 'object' && booking.slot !== null && 'startTime' in booking.slot ? booking.slot.startTime : booking.startTime;
    const endTimeRaw = typeof booking.slot === 'object' && booking.slot !== null && 'endTime' in booking.slot ? booking.slot.endTime : booking.endTime;

    // Check if dynamic or static slots properties are fully present to create an event
    if (bookingDateRaw && startTimeRaw && endTimeRaw) {
      try {
        const studentEmail = typeof booking.user === 'object' && booking.user !== null ? booking.user.email : undefined;
        const refreshToken = typeof booking.instructor === 'object' && booking.instructor !== null ? booking.instructor.googleRefreshToken : null;

        if (refreshToken && studentEmail) {
          const eventResult = await createSessionEvent({
            title: `Consultation with Next Academy`,
            description: `A 1-on-1 consultation booking. Reference ID: ${booking.id}`,
            date: bookingDateRaw,
            startTime: startTimeRaw,
            endTime: endTimeRaw,
            timezone: booking.timezone || 'Africa/Cairo',
            attendeeEmails: [studentEmail],
            refreshToken,
          });

          if (eventResult?.meetingUrl) {
            meetingUrl = eventResult.meetingUrl;
          }
        } else {
          console.warn('[webhook/paymob/consultation] Instructor has no calendar connected or student has no email.');
        }
      } catch (err) {
        console.error('[webhook/paymob/consultation] Error creating calendar event:', err);
      }
    }

    await payload.update({
      collection: 'consultation-bookings',
      id: consultationBookingId,
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        transactionId,
        ...(meetingUrl ? { meetingUrl } : {}),
      },
      overrideAccess: true,
      req: req as any,
    });

    if (slotId) {
      await payload.update({
        collection: 'consultation-slots',
        id: slotId,
        data: { status: 'booked' },
        overrideAccess: true,
        req: req as any,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook/paymob/consultation]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
