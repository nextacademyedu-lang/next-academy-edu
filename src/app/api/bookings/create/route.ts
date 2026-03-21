import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

function generateCode(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const { roundId, paymentPlanId, discountCode } = await req.json() as {
      roundId: string;
      paymentPlanId?: string;
      discountCode?: string;
    };

    if (!roundId) return NextResponse.json({ error: 'roundId مطلوب' }, { status: 400 });

    const payload = await getPayload({ config });

    // ── Auth ──────────────────────────────────────────────────────────────
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // ── Fetch round ───────────────────────────────────────────────────────
    const round = await payload.findByID({ collection: 'rounds', id: roundId, depth: 1 });
    if (!round) return NextResponse.json({ error: 'الراوند مش موجود' }, { status: 404 });
    if (!['open', 'upcoming'].includes(round.status ?? '')) {
      return NextResponse.json({ error: 'الراوند مش متاح للحجز' }, { status: 400 });
    }
    if ((round.currentEnrollments ?? 0) >= round.maxCapacity) {
      return NextResponse.json({ error: 'الراوند ممتلئ' }, { status: 400 });
    }

    // ── Check duplicate booking ───────────────────────────────────────────
    const existing = await payload.find({
      collection: 'bookings',
      where: {
        user: { equals: user.id },
        round: { equals: roundId },
        status: { not_in: ['cancelled', 'refunded'] },
      },
      limit: 1,
    });
    if (existing.totalDocs > 0) {
      return NextResponse.json({ error: 'لديك حجز مسبق في هذا الراوند' }, { status: 400 });
    }

    // ── Calculate amount ──────────────────────────────────────────────────
    let basePrice = round.price;
    if (round.earlyBirdPrice && round.earlyBirdDeadline && new Date(round.earlyBirdDeadline) > new Date()) {
      basePrice = round.earlyBirdPrice;
    }

    let discountAmount = 0;
    let appliedDiscountCode: string | undefined;

    if (discountCode) {
      const discountResult = await payload.find({
        collection: 'discount-codes',
        where: { code: { equals: discountCode.toUpperCase() }, isActive: { equals: true } },
        limit: 1,
        overrideAccess: true,
      });
      const discount = discountResult.docs[0];
      if (discount && new Date(discount.validUntil) > new Date() && (!discount.maxUses || (discount.currentUses ?? 0) < discount.maxUses)) {
        discountAmount = discount.type === 'percentage'
          ? Math.round((basePrice * discount.value) / 100)
          : Math.min(discount.value, basePrice);
        appliedDiscountCode = discount.code;

        // Increment usage
        await payload.update({
          collection: 'discount-codes',
          id: discount.id,
          data: { currentUses: (discount.currentUses || 0) + 1 },
          overrideAccess: true,
        });
      }
    }

    const finalAmount = basePrice - discountAmount;

    // ── Create booking ────────────────────────────────────────────────────
    const booking = await payload.create({
      collection: 'bookings',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        bookingCode: generateCode('BK'),
        user: user.id,
        round: roundId as unknown as number,
        paymentPlan: (paymentPlanId || null) as unknown as number | null,
        status: 'pending' as const,
        totalAmount: basePrice,
        paidAmount: 0,
        remainingAmount: finalAmount,
        discountCode: appliedDiscountCode,
        discountAmount,
        finalAmount,
        bookingSource: 'website' as const,
      },
    });

    // ── Create payment records ────────────────────────────────────────────
    const now = new Date();

    if (paymentPlanId) {
      // Installment plan — create N payment records
      const plan = await payload.findByID({ collection: 'payment-plans', id: paymentPlanId });
      if (!plan) return NextResponse.json({ error: 'خطة الدفع مش موجودة' }, { status: 404 });

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
        });
      }
    } else {
      // Full payment — single payment record
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
      });
    }

    // ── Increment round enrollments ───────────────────────────────────────
    await payload.update({
      collection: 'rounds',
      id: roundId,
      data: {
        currentEnrollments: (round.currentEnrollments ?? 0) + 1,
        status: (round.currentEnrollments ?? 0) + 1 >= round.maxCapacity && round.autoCloseOnFull ? 'full' : round.status,
      },
      overrideAccess: true,
    });

    return NextResponse.json({ bookingId: booking.id, bookingCode: booking.bookingCode });
  } catch (err) {
    console.error('[bookings/create]', err);
    return NextResponse.json({ error: 'حصلت مشكلة' }, { status: 500 });
  }
}
