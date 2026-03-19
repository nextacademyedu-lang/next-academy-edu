import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { verifyPaymobHmac } from '@/lib/payment-api';
import { sendBookingConfirmation } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── 1. HMAC verification ───────────────────────────────────────
    const hmac = body.hmac as string;
    if (!hmac || !verifyPaymobHmac(body.obj ?? body, hmac)) {
      console.warn('[webhook/paymob] HMAC mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const obj = body.obj ?? body;
    const success: boolean = obj.success === true || obj.success === 'true';
    const transactionId = String(obj.id);
    const amountCents: number = parseInt(obj.amount_cents ?? '0');
    const bookingId: string = obj.special_reference ?? obj.extras?.booking_id;
    const paymentId: string = obj.extras?.payment_id;

    if (!bookingId) {
      console.warn('[webhook/paymob] No booking_id in webhook');
      return NextResponse.json({ received: true });
    }

    const payload = await getPayload({ config });

    // ── 2. Idempotency — skip if already processed ─────────────────
    const existing = await payload.find({
      collection: 'payments',
      where: { transactionId: { equals: transactionId } },
      limit: 1,
    });

    if (existing.docs[0]?.status === 'paid') {
      return NextResponse.json({ received: true }); // duplicate webhook
    }

    // ── 3. Fetch payment record ────────────────────────────────────
    const payment = paymentId
      ? await payload.findByID({ collection: 'payments', id: paymentId })
      : existing.docs[0];

    if (!payment) {
      console.error('[webhook/paymob] Payment record not found', { bookingId, paymentId });
      return NextResponse.json({ received: true });
    }

    // ── 4. Amount validation ───────────────────────────────────────
    const expectedCents = Math.round(payment.amount * 100);
    if (success && Math.abs(amountCents - expectedCents) > 1) {
      console.error('[webhook/paymob] Amount mismatch', { expected: expectedCents, received: amountCents });
      await payload.update({
        collection: 'payments',
        id: payment.id,
        data: { status: 'failed', paymentGatewayResponse: { ...obj, _error: 'amount_mismatch' } },
      });
      return NextResponse.json({ received: true });
    }

    // ── 5. Update payment ──────────────────────────────────────────
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        status: success ? 'paid' : 'failed',
        transactionId,
        paidDate: success ? new Date().toISOString() : undefined,
        paymentGatewayResponse: obj,
      },
    });

    // ── 6. Update booking ──────────────────────────────────────────
    if (success) {
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

        // Send confirmation email if fully paid and not sent yet
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
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook/paymob]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
