import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { verifyEasyKashHmac } from '@/lib/payment-api';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;

    // ── 1. HMAC verification ───────────────────────────────────────
    if (!verifyEasyKashHmac(body)) {
      console.warn('[webhook/easykash] HMAC mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { easykashRef, Amount, status } = body;

    if (status !== 'PAID') {
      return NextResponse.json({ received: true }); // only process PAID
    }

    const payload = await getPayload({ config });

    // ── 2. Find payment by easykashRef (stored as transactionId) ───
    const result = await payload.find({
      collection: 'payments',
      where: { transactionId: { equals: easykashRef } },
      depth: 1,
      limit: 1,
    });

    const payment = result.docs[0];
    if (!payment) {
      console.error('[webhook/easykash] Payment not found for ref', easykashRef);
      return NextResponse.json({ received: true });
    }

    // ── 3. Idempotency ─────────────────────────────────────────────
    if (payment.status === 'paid') {
      return NextResponse.json({ received: true });
    }

    // ── 4. Amount validation ───────────────────────────────────────
    const receivedAmount = parseFloat(Amount);
    if (Math.abs(receivedAmount - payment.amount) > 0.01) {
      console.error('[webhook/easykash] Amount mismatch', { expected: payment.amount, received: receivedAmount });
      await payload.update({
        collection: 'payments',
        id: payment.id,
        data: { status: 'failed', paymentGatewayResponse: { ...body, _error: 'amount_mismatch' } },
      });
      return NextResponse.json({ received: true });
    }

    // ── 5. Update payment ──────────────────────────────────────────
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        status: 'paid',
        paidDate: new Date().toISOString(),
        paymentGatewayResponse: body,
      },
    });

    // ── 6. Update booking ──────────────────────────────────────────
    const bookingId = typeof payment.booking === 'object' ? payment.booking.id : payment.booking;
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 0 });

    if (booking) {
      const newPaid = (booking.paidAmount || 0) + payment.amount;
      const isFullyPaid = newPaid >= booking.finalAmount;
      await payload.update({
        collection: 'bookings',
        id: bookingId,
        data: {
          status: isFullyPaid ? 'confirmed' : 'pending',
          paidAmount: newPaid,
          remainingAmount: Math.max(0, booking.finalAmount - newPaid),
        },
      });

      if (isFullyPaid && !booking.confirmationEmailSent) {
        const user = await payload.findByID({ collection: 'users', id: typeof booking.user === 'object' ? booking.user.id : booking.user });
        const round = await payload.findByID({ collection: 'rounds', id: typeof booking.round === 'object' ? booking.round.id : booking.round, depth: 1 });
        const program = round?.program as any;
        await sendBookingConfirmation({
          to: user.email,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          programTitle: program?.titleAr || program?.titleEn || 'البرنامج',
          bookingCode: booking.bookingCode || String(booking.id),
          amountPaid: booking.finalAmount,
          startDate: round?.startDate ? new Date(round.startDate).toLocaleDateString('ar-EG') : '',
        });
        await payload.update({
          collection: 'bookings',
          id: bookingId,
          data: { confirmationEmailSent: true },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook/easykash]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
