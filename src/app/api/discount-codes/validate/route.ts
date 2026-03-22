import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { isAdminUser } from '@/lib/access-control';

function normalizeCode(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { code, bookingId } = await req.json() as { code: string; bookingId: string };

    if (!code || !bookingId) {
      return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
    }

    const normalizedCode = normalizeCode(code);
    if (!normalizedCode) {
      return NextResponse.json({ error: 'كود الخصم غير صالح' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Auth check
    const { user } = await payload.auth({ headers: req.headers });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch booking to get the amount + round
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 2 });
    if (!booking) return NextResponse.json({ error: 'الحجز مش موجود' }, { status: 404 });

    // Verify ownership
    const ownerId = typeof booking.user === 'object' ? booking.user.id : booking.user;
    const isOwner = String(ownerId) === String(user.id);
    const isAdmin = isAdminUser(user as { role?: string | null; email?: string | null });
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'غير مسموح لك بتعديل خصم هذا الحجز.' },
        { status: 403 },
      );
    }

    // Fetch discount code from DB — never trust client
    const result = await payload.find({
      collection: 'discount-codes',
      where: {
        or: [
          { code: { equals: normalizedCode } },
          { code: { equals: code.trim() } },
          { code: { equals: code.trim().toLowerCase() } },
        ],
      },
      depth: 0,
      limit: 10,
      overrideAccess: true,
      req: req as any,
    });

    let discount = result.docs.find((doc: { code?: string | null }) => {
      return normalizeCode(doc.code) === normalizedCode;
    });

    // Fallback: tolerate legacy codes saved with extra spaces/casing
    if (!discount) {
      const fallback = await payload.find({
        collection: 'discount-codes',
        where: { isActive: { equals: true } },
        depth: 0,
        limit: 200,
        overrideAccess: true,
        req: req as any,
      });
      discount = fallback.docs.find((doc: { code?: string | null }) => {
        return normalizeCode(doc.code) === normalizedCode;
      });
    }

    if (!discount || !discount.isActive) {
      return NextResponse.json({ error: 'كود الخصم غير صالح' }, { status: 400 });
    }

    const now = new Date();

    if (new Date(discount.validFrom) > now) {
      return NextResponse.json({ error: 'كود الخصم لم يبدأ بعد' }, { status: 400 });
    }

    if (new Date(discount.validUntil) < now) {
      return NextResponse.json({ error: 'كود الخصم منتهي الصلاحية' }, { status: 400 });
    }

    if (discount.maxUses && (discount.currentUses ?? 0) >= discount.maxUses) {
      return NextResponse.json({ error: 'كود الخصم وصل للحد الأقصى من الاستخدام' }, { status: 400 });
    }

    if (discount.minPurchaseAmount && booking.finalAmount < discount.minPurchaseAmount) {
      return NextResponse.json({
        error: `الحد الأدنى للشراء هو ${discount.minPurchaseAmount} جنيه`,
      }, { status: 400 });
    }

    // Check program/category restrictions
    if (discount.applicableTo === 'specific_programs' && discount.programs?.length) {
      const round = typeof booking.round === 'object' ? booking.round : null;
      const programId = round ? (typeof round.program === 'object' ? round.program.id : round.program) : null;
      const allowed = (discount.programs as any[]).map((p: any) => String(typeof p === 'object' ? p.id : p));
      if (!programId || !allowed.includes(String(programId))) {
        return NextResponse.json({ error: 'كود الخصم غير صالح لهذا البرنامج' }, { status: 400 });
      }
    }

    // Calculate discount amount server-side
    const originalAmount = booking.finalAmount;
    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = Math.round((originalAmount * discount.value) / 100);
    } else {
      discountAmount = Math.min(discount.value, originalAmount);
    }

    const newAmount = originalAmount - discountAmount;

    return NextResponse.json({
      valid: true,
      discountAmount,
      newAmount,
      type: discount.type,
      value: discount.value,
    });
  } catch (err) {
    console.error('[discount-codes/validate]', err);
    return NextResponse.json({ error: 'حصلت مشكلة' }, { status: 500 });
  }
}
