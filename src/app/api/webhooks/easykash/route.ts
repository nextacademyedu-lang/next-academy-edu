import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { verifyEasyKashHmac } from '@/lib/payment-api';
import { processSuccessfulPayment } from '@/lib/payment-helper';

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
      overrideAccess: true,
      req: req as any,
    });

    const payment = result.docs[0];
    if (!payment) {
      console.error('[webhook/easykash] Payment not found for ref', easykashRef);
      return NextResponse.json({ received: true });
    }

    const bookingId = typeof payment.booking === 'object'
      ? (payment.booking as unknown as { id: string | number }).id
      : payment.booking;

    // ── 3. Delegate to shared helper ───────────────────────────────
    const receivedCents = Math.round(parseFloat(Amount) * 100);

    await processSuccessfulPayment({
      paymentId: payment.id,
      bookingId,
      receivedAmountCents: receivedCents,
      transactionId: easykashRef,
      gatewayResponse: body as unknown as Record<string, unknown>,
      req: req as any,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook/easykash]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
