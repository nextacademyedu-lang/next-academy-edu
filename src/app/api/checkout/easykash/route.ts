import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { createEasyKashPayment, getBookingProgramTitle } from '@/lib/payment-api';
import type { CheckoutSession } from '@/lib/payment-api';

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json() as { bookingId: string };

    if (!bookingId) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    const payload = await getPayload({ config });

    // ── 1. Auth check ──────────────────────────────────────────────
    const { user } = await payload.auth({ headers: req.headers });
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
      method: 'fawry',
      amount: payment.amount,
      programTitle: getBookingProgramTitle(booking as any),
      userEmail: user.email ?? '',
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user.email ?? ''),
      userPhone: (user as any).phone || '01000000000',
    };

    // ── 5. Create EasyKash cash payment ────────────────────────────
    const cashResult = await createEasyKashPayment(session);

    // ── 6. Store voucher on payment record ─────────────────────────
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        paymentMethod: 'fawry',
        transactionId: cashResult.easykashRef,
        paymentGatewayResponse: cashResult,
        notes: `Voucher: ${cashResult.voucher} | Provider: ${cashResult.provider} | Expires: ${cashResult.expiryDate}`,
      },
    });

    return NextResponse.json({
      voucher: cashResult.voucher,
      provider: cashResult.provider,
      expiryDate: cashResult.expiryDate,
      easykashRef: cashResult.easykashRef,
      bookingId,
    });
  } catch (err) {
    console.error('[easykash/checkout]', err);
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}
