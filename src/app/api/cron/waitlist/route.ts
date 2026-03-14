import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { sendWaitlistNotification } from '@/lib/email';

// Called daily via cron: GET /api/cron/waitlist
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const now = new Date();
  const results = { notified: 0, expired: 0 };

  // ── 1. Expire notified entries that passed their 24h window ──────────────
  const expiredEntries = await payload.find({
    collection: 'waitlist',
    where: {
      status: { equals: 'notified' },
      expiresAt: { less_than: now.toISOString() },
    },
    limit: 200,
  });

  for (const entry of expiredEntries.docs) {
    await payload.update({
      collection: 'waitlist',
      id: entry.id,
      data: { status: 'expired' },
    });
    results.expired++;
  }

  // ── 2. Find rounds with open spots and waiting entries ───────────────────
  const rounds = await payload.find({
    collection: 'rounds',
    where: { status: { in: ['open', 'upcoming'] } },
    depth: 1,
    limit: 100,
  });

  for (const round of rounds.docs) {
    const hasSpot = round.currentEnrollments < round.maxCapacity;
    if (!hasSpot) continue;

    // Check if anyone already notified (don't double-notify)
    const alreadyNotified = await payload.find({
      collection: 'waitlist',
      where: {
        round: { equals: round.id },
        status: { equals: 'notified' },
      },
      limit: 1,
    });
    if (alreadyNotified.totalDocs > 0) continue;

    // Get next in line
    const next = await payload.find({
      collection: 'waitlist',
      where: {
        round: { equals: round.id },
        status: { equals: 'waiting' },
      },
      sort: 'position',
      limit: 1,
      depth: 1,
    });

    const entry = next.docs[0];
    if (!entry) continue;

    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    await payload.update({
      collection: 'waitlist',
      id: entry.id,
      data: {
        status: 'notified',
        notifiedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    });

    const user = await payload.findByID({
      collection: 'users',
      id: typeof entry.user === 'object' ? entry.user.id : entry.user,
    });

    const program = round.program as any;

    await sendWaitlistNotification({
      to: user.email,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      programTitle: program?.titleAr || program?.titleEn || 'البرنامج',
      roundId: String(round.id),
      expiresAt: expiresAt.toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    });

    results.notified++;
  }

  console.log('[cron/waitlist]', results);
  return NextResponse.json({ success: true, ...results });
}
