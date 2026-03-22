import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createPaymobIntention, getPaymobCheckoutUrl, getBookingProgramTitle } from '@/lib/payment-api';
import type { CheckoutSession } from '@/lib/payment-api';
import { authenticateRequestUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    if (process.env.ENABLE_PAYMOB !== 'true') {
      return NextResponse.json(
        { error: 'Paymob is temporarily disabled. Please use EasyKash / Fawry.' },
        { status: 503 },
      );
    }

    const { bookingId, method } = await req.json() as { bookingId: string; method: 'card' | 'wallet' };

    if (!bookingId || !['card', 'wallet'].includes(method)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // ── 1. Auth check ──────────────────────────────────────────────
    const user = await authenticateRequestUser(payload, req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ── 2. Fetch booking ───────────────────────────────────────────
    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
      depth: 3,
    });

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (typeof booking.user === 'object' ? booking.user.id !== user.id : booking.user !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!['pending', 'reserved'].includes(booking.status)) {
      return NextResponse.json({ error: 'Booking is not payable' }, { status: 400 });
    }

    // ── 3. Find pending payment record ─────────────────────────────
    const paymentsResult = await payload.find({
      collection: 'payments',
      where: { booking: { equals: bookingId }, status: { equals: 'pending' } },
      sort: 'installmentNumber',
      limit: 1,
    });

    const payment = paymentsResult.docs[0];
    if (!payment) return NextResponse.json({ error: 'No pending payment found' }, { status: 404 });

    // ── 4. Build session ───────────────────────────────────────────
    const session: CheckoutSession = {
      bookingId,
      paymentId: String(payment.id),
      method,
      amount: payment.amount,
      programTitle: getBookingProgramTitle(booking as any),
      userEmail: user.email ?? '',
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user.email ?? ''),
      userPhone: (user as any).phone || '',
    };

    // ── 5. Create Paymob intention ─────────────────────────────────
    const intention = await createPaymobIntention(session, method);

    // ── 6. Store client_secret on payment record ───────────────────
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        paymentMethod: 'paymob',
        paymentGatewayResponse: { client_secret: intention.client_secret },
      },
      req: req as any,
    });

    return NextResponse.json({
      redirectUrl: getPaymobCheckoutUrl(intention.client_secret),
    });
  } catch (err) {
    console.error('[paymob/checkout]', err);
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}
