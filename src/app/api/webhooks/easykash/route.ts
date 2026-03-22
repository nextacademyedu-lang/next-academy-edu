import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { verifyEasyKashHmac } from '@/lib/payment-api';
import { processSuccessfulPayment } from '@/lib/payment-helper';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    // ── 1. HMAC verification ───────────────────────────────────────
    if (!verifyEasyKashHmac(body)) {
      console.warn('[webhook/easykash] HMAC mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const easykashRef = String(body.easykashRef || '');
    const amountRaw = String(body.Amount || '');
    const status = String(body.status || '');
    const customerReference = String(body.customerReference || '');

    if (status !== 'PAID') {
      return NextResponse.json({ received: true }); // only process PAID
    }

    const payload = await getPayload({ config });
    let payment: any = null;

    // ── 2. Resolve payment (easykashRef first) ─────────────────────
    if (easykashRef) {
      const result = await payload.find({
        collection: 'payments',
        where: { transactionId: { equals: easykashRef } },
        depth: 1,
        limit: 1,
        overrideAccess: true,
        req: req as any,
      });
      payment = result.docs[0];
    }

    // Direct Pay flow stores customerReference as payment.id.
    if (!payment && customerReference) {
      try {
        payment = await payload.findByID({
          collection: 'payments',
          id: customerReference,
          depth: 1,
          overrideAccess: true,
          req: req as any,
        });
      } catch {
        payment = null;
      }
    }

    // Fallback: some integrations send booking id as customerReference.
    if (!payment && customerReference) {
      const byBooking = await payload.find({
        collection: 'payments',
        where: {
          and: [
            { booking: { equals: customerReference } },
            { status: { in: ['pending', 'overdue'] } },
          ],
        },
        sort: '-createdAt',
        limit: 1,
        overrideAccess: true,
        req: req as any,
      });
      payment = byBooking.docs[0];
    }

    if (!payment) {
      console.error('[webhook/easykash] Payment not found', { easykashRef, customerReference });
      return NextResponse.json({ received: true });
    }

    const bookingId = typeof payment.booking === 'object'
      ? (payment.booking as unknown as { id: string | number }).id
      : payment.booking;

    // ── 3. Delegate to shared helper ───────────────────────────────
    const receivedAmount = Number.parseFloat(amountRaw);
    if (!Number.isFinite(receivedAmount)) {
      console.error('[webhook/easykash] Invalid amount', amountRaw);
      return NextResponse.json({ received: true });
    }
    const receivedCents = Math.round(receivedAmount * 100);

    await processSuccessfulPayment({
      paymentId: payment.id,
      bookingId,
      receivedAmountCents: receivedCents,
      transactionId: easykashRef || String(payment.transactionId || `easykash-${payment.id}`),
      gatewayResponse: body as unknown as Record<string, unknown>,
      req: req as any,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook/easykash]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
