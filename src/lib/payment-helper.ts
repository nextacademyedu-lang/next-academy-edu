import { getPayload } from 'payload';
import config from '@payload-config';
import { sendBookingConfirmation } from '@/lib/email';
import { atomicIncrement } from '@/lib/atomic-db';
import { asPayloadRequest } from '@/lib/payload-request';

/**
 * Shared post-payment logic used by all webhook handlers (Paymob, EasyKash, etc).
 *
 * Handles:
 *  - Idempotency: skips if payment is already `paid`
 *  - Amount validation: marks payment `failed` on mismatch
 *  - Atomic `paidAmount` increment (re-reads booking inside update)
 *  - Confirmation email dispatch (once per booking)
 *
 * Returns `true` if the payment was successfully processed.
 */
export async function processSuccessfulPayment(opts: {
  paymentId: string | number;
  bookingId: string | number;
  receivedAmountCents: number;
  transactionId: string;
  gatewayResponse: Record<string, unknown>;
  req?: unknown;
}): Promise<boolean> {
  const {
    paymentId,
    bookingId,
    receivedAmountCents,
    transactionId,
    gatewayResponse,
    req,
  } = opts;
  const payload = await getPayload({ config });
  const reqForHooks = req ? asPayloadRequest(req as Request) : undefined;

  // ── 1. Fetch payment record ──────────────────────────────────────
  const payment = await payload.findByID({
    collection: 'payments',
    id: paymentId,
    overrideAccess: true,
    req: reqForHooks,
  });
  if (!payment) {
    console.error('[payment-helper] Payment not found', paymentId);
    return false;
  }

  // ── 2. Idempotency — already processed ───────────────────────────
  if (payment.status === 'paid') return true;

  // ── 3. Cross-validate payment belongs to booking ─────────────────
  const paymentBookingId = typeof payment.booking === 'object'
    ? (payment.booking as { id: string | number }).id
    : payment.booking;

  if (String(paymentBookingId) !== String(bookingId)) {
    console.error('[payment-helper] payment.booking mismatch', {
      paymentBookingId,
      expectedBookingId: bookingId,
    });
    return false;
  }

  // ── 4. Amount validation ─────────────────────────────────────────
  // EasyKash (and some gateways) return the Amount *inclusive* of
  // processing fees.  We must only reject genuine underpayments;
  // overpayments are expected and safe to accept.
  const expectedCents = Math.round(payment.amount * 100);
  if (receivedAmountCents < expectedCents - 1) {
    // Genuine underpayment → reject
    console.error('[payment-helper] Amount underpaid', {
      expected: expectedCents,
      received: receivedAmountCents,
    });
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        status: 'failed',
        paymentGatewayResponse: { ...gatewayResponse, _error: 'amount_underpaid' },
      },
      overrideAccess: true,
      req: reqForHooks,
    });
    return false;
  }
  if (receivedAmountCents > expectedCents + 1) {
    // Overpayment (gateway fees) — log but continue
    console.warn('[payment-helper] Amount includes gateway fees', {
      expected: expectedCents,
      received: receivedAmountCents,
      diff: receivedAmountCents - expectedCents,
    });
  }

  // ── 5. Mark payment as paid ──────────────────────────────────────
  await payload.update({
    collection: 'payments',
    id: payment.id,
    data: {
      status: 'paid',
      transactionId,
      paidDate: new Date().toISOString(),
      paymentGatewayResponse: gatewayResponse,
    },
    overrideAccess: true,
    req: reqForHooks,
  });

  // ── 6. Atomically increment paidAmount ─────────────────────────────────
  // Uses SQL `SET paid_amount = paid_amount + X` to prevent two concurrent
  // webhooks from double-crediting the same payment amount.
  const newPaid = await atomicIncrement(
    'bookings', bookingId, 'paid_amount', payment.amount,
  );

  // If the booking row doesn't exist, atomicIncrement returns null
  if (newPaid === null) return true;

  // Re-read to get finalAmount for status calculation
  const booking = await payload.findByID({
    collection: 'bookings',
    id: bookingId,
    depth: 0,
    overrideAccess: true,
    req: reqForHooks,
  });

  if (!booking) return true;

  const isFullyPaid = newPaid >= booking.finalAmount;

  await payload.update({
    collection: 'bookings',
    id: bookingId,
    data: {
      status: isFullyPaid ? 'confirmed' : 'pending',
      remainingAmount: Math.max(0, booking.finalAmount - newPaid),
    },
    overrideAccess: true,
    req: reqForHooks,
  });

  // ── 7. Send confirmation email (once) ────────────────────────────
  if (isFullyPaid && !booking.confirmationEmailSent) {
    try {
      const userId = typeof booking.user === 'object' ? (booking.user as unknown as { id: string | number })?.id : booking.user;
      const roundId = typeof booking.round === 'object' ? (booking.round as unknown as { id: string | number })?.id : booking.round;
      const eventId = typeof booking.event === 'object' ? (booking.event as unknown as { id: string | number })?.id : booking.event;

      if (!userId || (!roundId && !eventId)) {
        console.warn('[payment-helper] Missing userId or (roundId and eventId) for confirmation email', { userId, roundId, eventId });
        return true;
      }

      const user = await payload.findByID({
        collection: 'users',
        id: userId,
        overrideAccess: true,
        req: reqForHooks,
      });

      let emailTitle = '';
      let emailStartDate = '';
      let emailStartTime: string | null = null;
      let emailEndTime: string | null = null;
      let emailLocation: any = null;

      if (roundId) {
        const round = await payload.findByID({
          collection: 'rounds',
          id: roundId,
          depth: 1,
          overrideAccess: true,
          req: reqForHooks,
        });
        const program = round?.program as unknown as Record<string, string> | undefined;
        const roundData = round as unknown as Record<string, unknown>;

        emailTitle = program?.titleAr || program?.titleEn || '\u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062c';
        emailStartDate = round?.startDate ? new Date(round.startDate).toLocaleDateString('ar-EG') : '';
        emailStartTime = (roundData.sessionPlan as Array<{ startTime?: string }> | undefined)?.[0]?.startTime || null;
        emailEndTime = (roundData.sessionPlan as Array<{ endTime?: string }> | undefined)?.[0]?.endTime || null;
        emailLocation = round?.locationType ? {
          type: round.locationType as string,
          name: (roundData.locationName as string) || undefined,
          address: (roundData.locationAddress as string) || undefined,
          googleMapsUrl: (roundData.locationMapUrl as string) || undefined,
        } : null;
      } else if (eventId) {
        const event = await payload.findByID({
          collection: 'events',
          id: eventId as number,
          depth: 1,
          overrideAccess: true,
          req: reqForHooks,
        });

        emailTitle = event.titleAr || event.titleEn || '\u0627\u0644\u062d\u062f\u062b';
        emailStartDate = event.eventDate ? new Date(event.eventDate).toLocaleDateString('ar-EG') : '';
        emailStartTime = event.startTime || null;
        emailEndTime = event.endTime || null;
        emailLocation = event.locationType ? {
          type: event.locationType as string,
          name: event.venue || undefined,
          address: event.venueAddress || undefined,
          googleMapsUrl: event.googleMapsUrl || undefined,
        } : null;
      }

      await sendBookingConfirmation({
        to: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        programTitle: emailTitle,
        bookingCode: booking.bookingCode || String(booking.id),
        amountPaid: booking.finalAmount,
        startDate: emailStartDate,
        startTime: emailStartTime,
        endTime: emailEndTime,
        location: emailLocation,
      });

      await payload.update({
        collection: 'bookings',
        id: bookingId,
        data: { confirmationEmailSent: true },
        overrideAccess: true,
        req: reqForHooks,
      });
    } catch (emailErr) {
      // Don't fail the webhook if the email fails to send
      console.error('[payment-helper] Confirmation email failed', emailErr);
    }
  }

  return true;
}
