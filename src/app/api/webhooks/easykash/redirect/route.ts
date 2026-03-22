import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

function resolveBaseUrl(req: NextRequest): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SERVER_URL || req.nextUrl.origin;
}

function normalizeLocale(value: string | null): 'ar' | 'en' {
  return value === 'en' ? 'en' : 'ar';
}

function normalizeStatus(value: string | null): 'success' | 'pending' | 'failed' {
  const normalized = (value || '').trim().toLowerCase();
  if (normalized === 'success' || normalized === 'paid') return 'success';
  if (normalized === 'pending' || normalized === 'new') return 'pending';
  return 'failed';
}

async function resolveBookingIdByPaymentRef(paymentRef: string, req: NextRequest): Promise<string | null> {
  try {
    const payload = await getPayload({ config });
    const payment = await payload.findByID({
      collection: 'payments',
      id: paymentRef,
      depth: 0,
      overrideAccess: true,
      req: req as any,
    });
    if (!payment?.booking) return null;
    if (typeof payment.booking === 'object') return String((payment.booking as { id: string | number }).id);
    return String(payment.booking);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const status = normalizeStatus(req.nextUrl.searchParams.get('status'));
  const locale = normalizeLocale(req.nextUrl.searchParams.get('locale'));
  const customerReference = req.nextUrl.searchParams.get('customerReference');
  const voucher = req.nextUrl.searchParams.get('voucher') || req.nextUrl.searchParams.get('providerRefNum');
  const provider = req.nextUrl.searchParams.get('provider');

  let bookingId = req.nextUrl.searchParams.get('bookingId');
  if (!bookingId && customerReference) {
    bookingId = await resolveBookingIdByPaymentRef(customerReference, req);
  }
  if (!bookingId && customerReference) {
    bookingId = customerReference;
  }

  const base = resolveBaseUrl(req);
  const bookingQuery = bookingId ? `bookingId=${encodeURIComponent(bookingId)}` : '';

  if (status === 'success') {
    const target = new URL(`/${locale}/checkout/success`, base);
    if (bookingQuery) target.search = bookingQuery;
    return NextResponse.redirect(target);
  }

  if (status === 'pending') {
    const target = new URL(`/${locale}/checkout/pending`, base);
    if (bookingQuery) target.searchParams.set('bookingId', bookingId as string);
    if (voucher) target.searchParams.set('voucher', voucher);
    if (provider) target.searchParams.set('provider', provider);
    return NextResponse.redirect(target);
  }

  const target = new URL(`/${locale}/checkout/failed`, base);
  if (bookingQuery) target.search = bookingQuery;
  return NextResponse.redirect(target);
}

