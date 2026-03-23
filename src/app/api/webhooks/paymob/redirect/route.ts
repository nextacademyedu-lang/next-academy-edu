import { NextRequest, NextResponse } from 'next/server';

// Paymob redirects here after checkout with query params:
// ?success=true&id=<txn_id>&order=<order_id>&locale=ar&...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const success = searchParams.get('success');
  const pending = searchParams.get('pending');
  const bookingId = searchParams.get('merchant_order_id') ?? searchParams.get('order');
  const locale = searchParams.get('locale') === 'en' ? 'en' : 'ar';

  const base = process.env.NEXT_PUBLIC_APP_URL!;

  if (success === 'true') {
    return NextResponse.redirect(`${base}/${locale}/checkout/success?bookingId=${bookingId}`);
  }
  if (pending === 'true') {
    return NextResponse.redirect(`${base}/${locale}/checkout/pending?bookingId=${bookingId}`);
  }
  return NextResponse.redirect(`${base}/${locale}/checkout/failed?bookingId=${bookingId}`);
}
