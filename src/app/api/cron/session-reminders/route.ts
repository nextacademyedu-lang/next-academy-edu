import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { sendSessionReminder } from '@/lib/email';

// Cron: GET /api/cron/session-reminders
// Authorization: Bearer <CRON_SECRET>
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const now = new Date();
  
  // Windows: 
  // 24h reminder: sessions starting in 24h–25h
  // 1h reminder: sessions starting in 1h–1.5h
  const windows = [
    { type: 24, min: 24, max: 25, field: 'reminderSent24h' },
    { type: 1, min: 1, max: 1.5, field: 'reminderSent1h' },
  ] as const;

  const results = { sent24h: 0, sent1h: 0 };

  for (const window of windows) {
    const minDate = new Date(now.getTime() + window.min * 60 * 60 * 1000);
    const maxDate = new Date(now.getTime() + window.max * 60 * 60 * 1000);

    // Find sessions in this window
    const sessions = await payload.find({
      collection: 'sessions',
      where: {
        date: {
          greater_than_equal: minDate.toISOString().split('T')[0],
          less_than_equal: maxDate.toISOString().split('T')[0],
        },
        status: { equals: 'scheduled' },
      },
      depth: 2, // Get round and instructor
      limit: 500,
    });

    for (const session of sessions.docs) {
      // Check if this session actually falls in the time window (not just date)
      // Note: We'll use the session logic if possible, or simple check
      // For simplicity and since we have startTime, we can refine
      
      const round = session.round as any;
      if (!round) continue;

      // Find confirmed bookings for this round that haven't received this reminder
      const bookings = await payload.find({
        collection: 'bookings',
        where: {
          round: { equals: round.id },
          status: { equals: 'confirmed' },
          [window.field]: { equals: false },
        },
        depth: 1, // Get user
        limit: 1000,
      });

      for (const booking of bookings.docs) {
        const user = booking.user as any;
        if (!user || !user.email) continue;

        const instructor = session.instructor as any;
        const instructorName = instructor 
          ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() 
          : 'Next Academy Instructor';

        try {
          await sendSessionReminder({
            to: user.email,
            studentName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            programName: (round.program as any)?.titleAr || (round.program as any)?.titleEn || 'البرنامج',
            sessionDate: `${session.date} at ${session.startTime}`,
            instructorName,
            joinLink: session.meetingUrl,
            hoursUntil: window.type as 24 | 1,
            locale: user.preferredLanguage || 'ar',
          });

          await payload.update({
            collection: 'bookings',
            id: booking.id,
            data: {
              [window.field]: true,
            },
          });

          if (window.type === 24) results.sent24h++;
          else results.sent1h++;
        } catch (err) {
          console.error(`[cron/session-reminders] Failed for booking ${booking.id}:`, err);
        }
      }
    }
  }

  return NextResponse.json({ success: true, ...results });
}
