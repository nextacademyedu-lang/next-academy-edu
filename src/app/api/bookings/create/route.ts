import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { authenticateRequestUser } from '@/lib/server-auth';
import crypto from 'node:crypto';
import { assertTrustedWriteRequest } from '@/lib/csrf';
import { atomicIncrement, atomicIncrementWithLimit, atomicIncrementWithCeiling } from '@/lib/atomic-db';
import { processSuccessfulPayment } from '@/lib/payment-helper';

function generateCode(prefix: string): string {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${random}`;
}

function normalizeNumericId(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber)) return asNumber;
  }
  return null;
}

export async function POST(req: NextRequest) {
  let stage = 'init';
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    stage = 'parse_request';
    const { roundId, paymentPlanId, discountCode } = await req.json() as {
      roundId: string | number;
      paymentPlanId?: string | number;
      discountCode?: string;
    };

    const normalizedRoundId = normalizeNumericId(roundId);
    if (normalizedRoundId == null) {
      return NextResponse.json({ error: 'roundId مطلوب' }, { status: 400 });
    }

    const normalizedPaymentPlanId = normalizeNumericId(paymentPlanId ?? null);

    stage = 'get_payload';
    const payload = await getPayload({ config });

    // ── Auth ──────────────────────────────────────────────────────────────
    stage = 'auth';
    const user = await authenticateRequestUser(payload, req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ── Fetch round ───────────────────────────────────────────────────────
    stage = 'find_round';
    const round = await payload.findByID({
      collection: 'rounds',
      id: normalizedRoundId,
      depth: 1,
    });
    if (!round) return NextResponse.json({ error: 'الراوند مش موجود' }, { status: 404 });
    if (!['open', 'upcoming'].includes(round.status ?? '')) {
      return NextResponse.json({ error: 'الراوند مش متاح للحجز' }, { status: 400 });
    }
    if ((round.currentEnrollments ?? 0) >= round.maxCapacity) {
      return NextResponse.json({ error: 'الراوند ممتلئ' }, { status: 400 });
    }

    // ── Check duplicate booking ───────────────────────────────────────────
    stage = 'check_duplicate';
    const existing = await payload.find({
      collection: 'bookings',
      where: {
        user: { equals: user.id },
        round: { equals: normalizedRoundId },
        status: { not_in: ['cancelled', 'refunded'] },
      },
      limit: 1,
    });
    if (existing.totalDocs > 0) {
      return NextResponse.json({ error: 'لديك حجز مسبق في هذا الراوند' }, { status: 400 });
    }

    // ── Calculate amount ──────────────────────────────────────────────────
    stage = 'calculate_amount';
    let basePrice = round.price;
    if (round.earlyBirdPrice && round.earlyBirdDeadline && new Date(round.earlyBirdDeadline) > new Date()) {
      basePrice = round.earlyBirdPrice;
    }

    let discountAmount = 0;
    let appliedDiscountCode: string | undefined;

    if (discountCode) {
      stage = 'find_discount';
      const discountResult = await payload.find({
        collection: 'discount-codes',
        where: { code: { equals: discountCode.toUpperCase() }, isActive: { equals: true } },
        limit: 1,
        overrideAccess: true,
      });
      const discount = discountResult.docs[0];
      if (discount && new Date(discount.validUntil) > new Date() && (!discount.maxUses || (discount.currentUses ?? 0) < discount.maxUses)) {
        stage = 'apply_discount';
        discountAmount = discount.type === 'percentage'
          ? Math.round((basePrice * discount.value) / 100)
          : Math.min(discount.value, basePrice);
        appliedDiscountCode = discount.code;

        // Atomically increment currentUses — returns null if maxUses ceiling reached
        stage = 'increment_discount_uses';
        if (discount.maxUses) {
          const newUses = await atomicIncrementWithLimit(
            'discount_codes', discount.id, 'current_uses', 1, discount.maxUses,
          );
          if (newUses === null) {
            // Another request used the last slot — discard the discount
            discountAmount = 0;
            appliedDiscountCode = undefined;
          }
        } else {
          // No limit — just increment
          await atomicIncrement('discount_codes', discount.id, 'current_uses', 1);
        }
      }
    }

    const finalAmount = basePrice - discountAmount;
    const isFreeBooking = finalAmount <= 0;

    // ── Create booking ────────────────────────────────────────────────────
    stage = 'create_booking';
    const booking = await payload.create({
      collection: 'bookings',
      data: {
        bookingCode: generateCode('BK'),
        user: user.id,
        round: normalizedRoundId,
        paymentPlan: normalizedPaymentPlanId,
        status: 'pending' as const,
        totalAmount: basePrice,
        paidAmount: 0,
        remainingAmount: finalAmount,
        discountCode: appliedDiscountCode,
        discountAmount,
        finalAmount,
        bookingSource: 'website' as const,
      },
      req: req as any,
    });

    // ── Create payment records ────────────────────────────────────────────
    const now = new Date();
    let freePaymentId: number | string | null = null;

    if (isFreeBooking) {
      // Free booking: create a single zero-amount payment, then auto-settle it.
      stage = 'create_free_payment';
      const freePayment = await payload.create({
        collection: 'payments',
        data: {
          paymentCode: generateCode('PAY'),
          booking: booking.id,
          amount: 0,
          dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
        overrideAccess: true,
        req: req as any,
      });
      freePaymentId = freePayment.id;
    } else if (normalizedPaymentPlanId != null) {
      // Installment plan — create N payment records
      stage = 'find_payment_plan';
      const plan = await payload.findByID({
        collection: 'payment-plans',
        id: normalizedPaymentPlanId,
      });
      if (!plan) return NextResponse.json({ error: 'خطة الدفع مش موجودة' }, { status: 404 });

      stage = 'create_installments';
      for (const installment of plan.installments) {
        const dueDate = new Date(now.getTime() + installment.dueDaysFromBooking * 24 * 60 * 60 * 1000);
        const amount = Math.round((finalAmount * installment.percentage) / 100);

        await payload.create({
          collection: 'payments',
          data: {
            paymentCode: generateCode('PAY'),
            booking: booking.id,
            installmentNumber: installment.installmentNumber,
            amount,
            dueDate: dueDate.toISOString(),
            status: 'pending',
          },
          overrideAccess: true,
          req: req as any,
        });
      }
    } else {
      // Full payment — single payment record
      stage = 'create_full_payment';
      await payload.create({
        collection: 'payments',
        data: {
          paymentCode: generateCode('PAY'),
          booking: booking.id,
          amount: finalAmount,
          dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
        overrideAccess: true,
        req: req as any,
      });
    }

    // ── Atomically increment enrollments (single SQL statement) ────────────
    // Returns null if current_enrollments + 1 would exceed max_capacity.
    stage = 'increment_round_enrollments';
    const newEnrollments = await atomicIncrementWithCeiling(
      'rounds', normalizedRoundId, 'current_enrollments', 1, 'max_capacity',
    );

    if (newEnrollments === null) {
      // Capacity filled by a concurrent request — abort gracefully
      // Roll back discount usage atomically if it was incremented
      if (appliedDiscountCode) {
        const dcResult = await payload.find({
          collection: 'discount-codes',
          where: { code: { equals: appliedDiscountCode } },
          limit: 1,
          overrideAccess: true,
        });
        const dc = dcResult.docs[0];
        if (dc) {
          await atomicIncrement('discount_codes', dc.id, 'current_uses', -1);
        }
      }
      // Mark the booking as cancelled since we can't actually enroll
      await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: { status: 'cancelled' as const },
        overrideAccess: true,
        req: req as any,
      });
      return NextResponse.json({ error: 'الراوند ممتلئ' }, { status: 400 });
    }

    // Auto-close round if now full
    if (round.autoCloseOnFull && newEnrollments >= round.maxCapacity) {
      await payload.update({
        collection: 'rounds',
        id: normalizedRoundId,
        data: { status: 'full' },
        overrideAccess: true,
        req: req as any,
      });
    }

    if (isFreeBooking && freePaymentId != null) {
      stage = 'auto_confirm_free_booking';
      await processSuccessfulPayment({
        paymentId: freePaymentId,
        bookingId: booking.id,
        receivedAmountCents: 0,
        transactionId: `FREE-${booking.id}-${Date.now()}`,
        gatewayResponse: {
          gateway: 'internal',
          flow: 'free-booking',
          amountCents: 0,
        },
        req: req as any,
      });
    }

    stage = 'done';
    return NextResponse.json({
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      isFree: isFreeBooking,
    });
  } catch (err) {
    console.error('[bookings/create]', { stage, err });
    return NextResponse.json({ error: 'حصلت مشكلة' }, { status: 500 });
  }
}
