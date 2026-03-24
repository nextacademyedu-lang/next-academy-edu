import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { isAdminUser } from '@/lib/access-control';
import { authenticateRequestUser } from '@/lib/server-auth';
import { assertTrustedWriteRequest } from '@/lib/csrf';
import { atomicIncrement } from '@/lib/atomic-db';

export async function POST(req: NextRequest) {
  try {
    const csrfError = assertTrustedWriteRequest(req);
    if (csrfError) return csrfError;

    const { bookingId } = await req.json() as { bookingId: string };

    if (!bookingId) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Auth check
    const user = await authenticateRequestUser(payload, req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch booking
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 0 });
    if (!booking) return NextResponse.json({ error: 'الحجز مش موجود' }, { status: 404 });

    // Verify ownership
    const ownerId = typeof booking.user === 'object' ? (booking.user as any).id : booking.user;
    const isOwner = String(ownerId) === String(user.id);
    const isAdmin = isAdminUser(user as { role?: string | null; email?: string | null });
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'غير مسموح لك بتعديل خصم هذا الحجز.' },
        { status: 403 },
      );
    }

    // Guard: no discount to remove
    const discountAmount = booking.discountAmount ?? 0;
    if (discountAmount <= 0 && !booking.discountCode) {
      return NextResponse.json({ error: 'مفيش خصم مطبق على الحجز ده' }, { status: 400 });
    }

    // Restore original amount
    const restoredAmount = (booking.finalAmount ?? 0) + discountAmount;

    // Update booking: clear discount fields, restore finalAmount
    await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: {
        discountCode: '',
        discountAmount: 0,
        finalAmount: restoredAmount,
        remainingAmount: Math.max(0, restoredAmount - (booking.paidAmount || 0)),
      },
      overrideAccess: true,
    });

    // Recalculate pending payment amounts back to original proportions
    const currentFinal = booking.finalAmount ?? 0;
    if (currentFinal > 0) {
      const pendingPayments = await payload.find({
        collection: 'payments',
        where: { booking: { equals: bookingId }, status: { equals: 'pending' } },
        sort: 'installmentNumber',
        limit: 50,
        overrideAccess: true,
      });

      for (const pmt of pendingPayments.docs) {
        const pct = currentFinal > 0 ? pmt.amount / currentFinal : 1;
        const recalculated = Math.round(restoredAmount * pct);
        await payload.update({
          collection: 'payments',
          id: pmt.id,
          data: { amount: recalculated },
          overrideAccess: true,
        });
      }
    }

    // Decrement discount code usage
    if (booking.discountCode) {
      try {
        await atomicIncrement('discount_codes', booking.discountCode, 'current_uses', -1);
      } catch {
        // Non-critical: log but don't fail the request
        console.warn('[discount-codes/remove] Failed to decrement usage for', booking.discountCode);
      }
    }

    return NextResponse.json({
      success: true,
      restoredAmount,
    });
  } catch (err) {
    console.error('[discount-codes/remove]', err);
    return NextResponse.json({ error: 'حصلت مشكلة' }, { status: 500 });
  }
}
