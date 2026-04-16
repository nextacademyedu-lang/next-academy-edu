import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymobHmac } from '@/lib/payment-api';
import { processSuccessfulPayment } from '@/lib/payment-helper';
import { getPayload } from 'payload';
import config from '@payload-config';
import { asPayloadRequest } from '@/lib/payload-request';

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

    // ── 2. Handle non-success ──────────────────────────────────────
    if (!success) {
      if (paymentId) {
        const payload = await getPayload({ config });
        await payload.update({
          collection: 'payments',
          id: paymentId,
          data: {
            status: 'failed',
            transactionId,
            paymentGatewayResponse: obj,
          },
          overrideAccess: true,
          req: asPayloadRequest(req),
        });
      }
      return NextResponse.json({ received: true });
    }

    // ── 3. Resolve payment ID ──────────────────────────────────────
    let resolvedPaymentId: string | undefined = paymentId;
    if (!resolvedPaymentId) {
      const payload = await getPayload({ config });
      const existing = await payload.find({
        collection: 'payments',
        where: { transactionId: { equals: transactionId } },
        limit: 1,
        overrideAccess: true,
        req: asPayloadRequest(req),
      });
      resolvedPaymentId = existing.docs[0]?.id != null ? String(existing.docs[0].id) : undefined;
    }

    if (!resolvedPaymentId) {
      console.error('[webhook/paymob] Cannot resolve payment', { bookingId, transactionId });
      return NextResponse.json({ received: true });
    }

    // ── 4. Delegate to shared helper ───────────────────────────────
    await processSuccessfulPayment({
      paymentId: resolvedPaymentId,
      bookingId,
      receivedAmountCents: amountCents,
      transactionId,
      gatewayResponse: obj,
      req: asPayloadRequest(req),
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook/paymob]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
