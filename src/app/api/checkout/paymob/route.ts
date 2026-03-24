import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  createEasyKashDirectPay,
  createPaymobIntention,
  extractEasyKashProductCode,
  getBookingCurrency,
  getBookingProgramTitle,
  getPaymobCheckoutUrl,
} from '@/lib/payment-api';
import type { CheckoutSession } from '@/lib/payment-api';
import { authenticateRequestUser } from '@/lib/server-auth';
import { assertTrustedWriteRequest } from '@/lib/csrf';

export async function POST(req: NextRequest) {
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    const { bookingId, method, locale } = await req.json() as {
      bookingId: string;
      method: 'card' | 'wallet';
      locale?: string;
    };

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

    const previousGatewayResponse =
      payment.paymentGatewayResponse && typeof payment.paymentGatewayResponse === 'object'
        ? (payment.paymentGatewayResponse as Record<string, unknown>)
        : {};

    // ── 5A. Compatibility fallback to EasyKash when Paymob is disabled ──
    const paymobEnabled = process.env.ENABLE_PAYMOB === 'true';
    console.log(`[paymob/checkout] ENABLE_PAYMOB=${process.env.ENABLE_PAYMOB}, paymobEnabled=${paymobEnabled}, method=${method}`);
    if (!paymobEnabled) {
      const currency = getBookingCurrency(booking as any);
      // EasyKash rejects duplicate customerReference — append timestamp to make it unique per attempt
      const custRef = `${payment.id}-${Date.now()}`;
      const directPay = await createEasyKashDirectPay(session, {
        currency,
        locale: typeof locale === 'string' ? locale : undefined,
        customerReference: custRef,
      });
      const productCode = extractEasyKashProductCode(directPay.redirectUrl);

      await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          paymentMethod: 'paymob',
          transactionId: productCode || undefined,
          paymentGatewayResponse: {
            ...previousGatewayResponse,
            gateway: 'easykash',
            flow: 'directpay',
            method,
            currency,
            customerReference: custRef,
            redirectUrl: directPay.redirectUrl,
            productCode,
          },
          notes: productCode
            ? `EasyKash DirectPay (${method}) | ProductCode: ${productCode}`
            : `EasyKash DirectPay (${method})`,
        },
        req: req as any,
      });

      return NextResponse.json({
        redirectUrl: directPay.redirectUrl,
        gateway: 'easykash',
        method,
        currency,
      });
    }

    // ── 5B. Native Paymob flow (if explicitly enabled) ─────────────
    const integrationId = method === 'wallet'
      ? process.env.PAYMOB_WALLET_INTEGRATION_ID
      : process.env.PAYMOB_INTEGRATION_ID;
    if (!process.env.PAYMOB_API_KEY || !integrationId) {
      console.error('[paymob/checkout] Missing env vars: PAYMOB_API_KEY=', !!process.env.PAYMOB_API_KEY, 'integrationId=', integrationId);
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 });
    }
    const intention = await createPaymobIntention(session, method, typeof locale === 'string' ? locale : undefined);

    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        paymentMethod: 'paymob',
        paymentGatewayResponse: {
          ...previousGatewayResponse,
          gateway: 'paymob',
          client_secret: intention.client_secret,
        },
      },
      req: req as any,
    });

    return NextResponse.json({ redirectUrl: getPaymobCheckoutUrl(intention.client_secret) });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[paymob/checkout] Error:', errorMessage, err instanceof Error ? err.stack : '');
    return NextResponse.json(
      { error: 'Payment initiation failed', details: process.env.NODE_ENV === 'development' ? errorMessage : undefined },
      { status: 500 },
    );
  }
}
