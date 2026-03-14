import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { sendOverdueNotification, sendPaymentReminder } from '@/lib/email';

// Called daily via cron: GET /api/cron/check-overdue
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const now = new Date();
  const results = { overdue: 0, reminded: 0, blocked: 0 };

  // ── 1. Mark overdue payments ──────────────────────────────────────────────
  const overduePayments = await payload.find({
    collection: 'payments',
    where: {
      status: { equals: 'pending' },
      dueDate: { less_than: now.toISOString() },
    },
    depth: 2,
    limit: 200,
  });

  for (const payment of overduePayments.docs) {
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: { status: 'overdue' },
    });
    results.overdue++;

    // Block booking access
    const bookingId = typeof payment.booking === 'object' ? payment.booking.id : payment.booking;
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 1 });

    if (booking && !booking.accessBlocked) {
      await payload.update({
        collection: 'bookings',
        id: bookingId,
        data: { accessBlocked: true, status: 'payment_failed' },
      });
      results.blocked++;

      // Notify user
      const user = await payload.findByID({
        collection: 'users',
        id: typeof booking.user === 'object' ? booking.user.id : booking.user,
      });
      const round = booking.round as any;
      const program = round?.program as any;

      await sendOverdueNotification({
        to: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        programTitle: program?.titleAr || program?.titleEn || 'البرنامج',
        amount: payment.amount,
        bookingId: String(bookingId),
      });
    }
  }

  // ── 2. Send reminders for payments due in 3 days ──────────────────────────
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const upcomingPayments = await payload.find({
    collection: 'payments',
    where: {
      status: { equals: 'pending' },
      dueDate: { greater_than: now.toISOString(), less_than: in3Days.toISOString() },
      reminderSentCount: { less_than: 1 },
    },
    depth: 2,
    limit: 200,
  });

  for (const payment of upcomingPayments.docs) {
    const bookingId = typeof payment.booking === 'object' ? payment.booking.id : payment.booking;
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 2 });
    if (!booking) continue;

    const user = await payload.findByID({
      collection: 'users',
      id: typeof booking.user === 'object' ? booking.user.id : booking.user,
    });
    const round = booking.round as any;
    const program = round?.program as any;

    await sendPaymentReminder({
      to: user.email,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      programTitle: program?.titleAr || program?.titleEn || 'البرنامج',
      amount: payment.amount,
      dueDate: new Date(payment.dueDate).toLocaleDateString('ar-EG'),
      bookingId: String(bookingId),
    });

    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        reminderSentCount: (payment.reminderSentCount || 0) + 1,
        lastReminderSent: now.toISOString(),
      },
    });
    results.reminded++;
  }

  console.log('[cron/check-overdue]', results);
  return NextResponse.json({ success: true, ...results });
}
