import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

// GET /api/admin/find-stuck-users
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stuckBookings = await payload.find({
      collection: 'bookings',
      where: {
        status: { in: ['payment_failed', 'cancelled_overdue', 'pending'] },
        updatedAt: { greater_than_equal: sevenDaysAgo.toISOString() },
      },
      limit: 1000,
      depth: 2,
    });

    const usersMap = new Map();

    for (const booking of stuckBookings.docs) {
      const user = booking.user as any;
      if (!user || !user.email) continue;

      const round = booking.round as any;
      const event = booking.event as any;
      
      let targetName = 'Unknown Program';
      if (round && round.program) {
          targetName = round.program.titleAr || round.program.titleEn || 'Unknown Program';
      } else if (event) {
          targetName = event.titleAr || event.titleEn || 'Unknown Event';
      }

      const key = `${user.email}-${targetName}`;
      
      if (!usersMap.has(key)) {
        usersMap.set(key, {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.email,
          phone: user.phone || 'N/A',
          target: targetName,
          status: booking.status,
          date: new Date(booking.updatedAt).toLocaleDateString('ar-EG')
        });
      }
    }

    return NextResponse.json({
      totalAffected: usersMap.size,
      users: Array.from(usersMap.values())
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
