import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

function normalizeId(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

// Paymob redirects here after checkout with query params:
// ?success=true&id=<txn_id>&order=<order_id>&locale=ar&...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const success = searchParams.get('success');
  const pending = searchParams.get('pending');
  const bookingId = searchParams.get('merchant_order_id') ?? searchParams.get('order');
  const locale = searchParams.get('locale') === 'en' ? 'en' : 'ar';
  const flow = searchParams.get('flow');
  const consultationBookingId =
    searchParams.get('consultationBookingId') ||
    searchParams.get('consultation_booking_id') ||
    bookingId;
  const instructor = searchParams.get('instructor');

  const base = process.env.NEXT_PUBLIC_APP_URL!;

  if (flow === 'consultation') {
    const params = new URLSearchParams({
      intent: 'consultation',
      consultationBookingId: consultationBookingId || '',
    });
    if (instructor) params.set('instructor', instructor);

    if (success === 'true') {
      params.set('payment', 'success');
      return NextResponse.redirect(`${base}/${locale}/contact?${params.toString()}`);
    }
    if (pending === 'true') {
      params.set('payment', 'pending');
      return NextResponse.redirect(`${base}/${locale}/contact?${params.toString()}`);
    }

    const bookingIdNumeric = normalizeId(consultationBookingId);
    if (bookingIdNumeric) {
      try {
        const payload = await getPayload({ config });
        const booking = await payload.findByID({
          collection: 'consultation-bookings',
          id: bookingIdNumeric,
          depth: 0,
          overrideAccess: true,
        });

        const slot =
          typeof booking?.slot === 'object' && booking?.slot
            ? Number((booking.slot as { id?: unknown }).id)
            : Number(booking?.slot);

        await payload.update({
          collection: 'consultation-bookings',
          id: bookingIdNumeric,
          data: {
            status: 'cancelled',
            cancellationReason: 'Payment redirect returned failed status',
          },
          overrideAccess: true,
        });

        if (Number.isFinite(slot)) {
          await payload.update({
            collection: 'consultation-slots',
            id: slot,
            data: { status: 'available' },
            overrideAccess: true,
          });
        }
      } catch (error) {
        console.error('[webhook/paymob/redirect] consultation failure rollback failed', error);
      }
    }

    params.set('payment', 'failed');
    return NextResponse.redirect(`${base}/${locale}/contact?${params.toString()}`);
  }

  if (success === 'true') {
    return NextResponse.redirect(`${base}/${locale}/checkout/success?bookingId=${bookingId}`);
  }
  if (pending === 'true') {
    return NextResponse.redirect(`${base}/${locale}/checkout/pending?bookingId=${bookingId}`);
  }
  return NextResponse.redirect(`${base}/${locale}/checkout/failed?bookingId=${bookingId}`);
}
