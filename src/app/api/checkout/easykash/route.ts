import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  createEasyKashDirectPay,
  createEasyKashPayment,
  extractEasyKashProductCode,
  getBookingCurrency,
  getBookingProgramTitle,
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
      method?: 'card' | 'wallet' | 'fawry' | 'aman';
      locale?: string;
    };
    const selectedMethod = method ?? 'fawry';

    if (!bookingId || !['card', 'wallet', 'fawry', 'aman'].includes(selectedMethod)) {
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
      method: selectedMethod,
      amount: payment.amount,
      programTitle: getBookingProgramTitle(booking as any),
      userEmail: user.email ?? '',
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || (user.email ?? ''),
      userPhone: (user as any).phone || '01000000000',
    };

    const previousGatewayResponse =
      payment.paymentGatewayResponse && typeof payment.paymentGatewayResponse === 'object'
        ? (payment.paymentGatewayResponse as Record<string, unknown>)
        : {};

    // ── 5. Card/Wallet via EasyKash Direct Pay ─────────────────────
    if (selectedMethod === 'card' || selectedMethod === 'wallet') {
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
          // Keeping existing enum compatibility: card/wallet had been represented as "paymob".
          paymentMethod: 'paymob',
          transactionId: productCode || undefined,
          paymentGatewayResponse: {
            ...previousGatewayResponse,
            gateway: 'easykash',
            flow: 'directpay',
            method: selectedMethod,
            currency,
            customerReference: custRef,
            redirectUrl: directPay.redirectUrl,
            productCode,
          },
          notes: productCode
            ? `EasyKash DirectPay (${selectedMethod}) | ProductCode: ${productCode}`
            : `EasyKash DirectPay (${selectedMethod})`,
        },
        req: req as any,
      });

      return NextResponse.json({
        redirectUrl: directPay.redirectUrl,
        bookingId,
        gateway: 'easykash',
        method: selectedMethod,
        currency,
      });
    }

    // ── 6. Cash voucher via EasyKash Cash API (Fawry/Aman) ─────────
    const cashResult = await createEasyKashPayment(session);

    // ── 7. Store voucher on payment record ─────────────────────────
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        paymentMethod: 'fawry',
        transactionId: cashResult.easykashRef,
        paymentGatewayResponse: {
          ...previousGatewayResponse,
          gateway: 'easykash',
          flow: 'cash-api',
          method: selectedMethod,
          ...cashResult,
        },
        notes: `Voucher: ${cashResult.voucher} | Provider: ${cashResult.provider} | Expires: ${cashResult.expiryDate}`,
      },
      req: req as any,
    });

    return NextResponse.json({
      voucher: cashResult.voucher,
      provider: cashResult.provider,
      expiryDate: cashResult.expiryDate,
      easykashRef: cashResult.easykashRef,
      bookingId,
      gateway: 'easykash',
      method: selectedMethod,
    });
  } catch (err) {
    console.error('[easykash/checkout]', err);
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}
