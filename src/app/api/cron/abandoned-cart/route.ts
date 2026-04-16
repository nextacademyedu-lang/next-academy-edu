import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { sendAbandonedCartEmail } from '@/lib/email';

// Cron: GET /api/cron/abandoned-cart
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const now = new Date();

  // Windows:
  // 1h recovery: started 1h–2h ago
  // 24h recovery: started 24h–25h ago
  const windows = [
    { type: 1, min: 1, max: 2, field: 'cartRecovery1hSent', followUp: false },
    { type: 24, min: 24, max: 25, field: 'cartRecovery24hSent', followUp: true },
  ] as const;

  const results = { recovered1h: 0, recovered24h: 0 };

  for (const window of windows) {
    const minDate = new Date(now.getTime() - window.max * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() - window.min * 60 * 60 * 1000);

    const bookings = await payload.find({
      collection: 'bookings',
      where: {
        status: { equals: 'pending' },
        checkoutStartedAt: {
          greater_than_equal: minDate.toISOString(),
          less_than_equal: maxDate.toISOString(),
        },
        [window.field]: { equals: false },
        // Also ensure no other recovery email was sent if this is the 24h one
        // and that they didn't just book a confirmed one later (complex, but simple check is enough)
      },
      depth: 2, // Get user and round/program
      limit: 1000,
    });

    for (const booking of bookings.docs) {
      const user = booking.user as any;
      if (!user || !user.email) continue;

      const round = booking.round as any;
      const programName = round?.program?.titleAr || round?.program?.titleEn || 'البرنامج';

      try {
        await sendAbandonedCartEmail({
          to: user.email,
          studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          programName,
          price: (round as any)?.price || booking.totalAmount,
          checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com'}/checkout/${booking.id}`,
          followUp: window.followUp,
          locale: user.preferredLanguage || 'ar',
        });

        await payload.update({
          collection: 'bookings',
          id: booking.id,
          data: {
            [window.field]: true,
          },
        });

        if (window.type === 1) results.recovered1h++;
        else results.recovered24h++;
      } catch (err) {
        console.error(`[cron/abandoned-cart] Failed for booking ${booking.id}:`, err);
      }
    }
  }

  return NextResponse.json({ success: true, ...results });
}
