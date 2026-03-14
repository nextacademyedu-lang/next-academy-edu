import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

function generateCertCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CERT-';
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { bookingId, quizScore } = await req.json() as {
      bookingId: string;
      quizScore?: number;
    };

    if (!bookingId) return NextResponse.json({ error: 'bookingId مطلوب' }, { status: 400 });

    const payload = await getPayload({ config });

    // Admin only
    const { user } = await payload.auth({ headers: req.headers });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch booking
    const booking = await payload.findByID({ collection: 'bookings', id: bookingId, depth: 2 });
    if (!booking) return NextResponse.json({ error: 'الحجز مش موجود' }, { status: 404 });
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      return NextResponse.json({ error: 'الحجز لازم يكون confirmed أو completed' }, { status: 400 });
    }

    // Check if certificate already exists
    const existing = await payload.find({
      collection: 'certificates',
      where: { booking: { equals: bookingId } },
      limit: 1,
    });
    if (existing.totalDocs > 0) {
      return NextResponse.json({ certificateCode: existing.docs[0].certificateCode, alreadyExists: true });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nextacademyedu.com';
    const certCode = generateCertCode();
    const round = booking.round as any;
    const program = round?.program as any;

    const cert = await payload.create({
      collection: 'certificates',
      data: {
        certificateCode: certCode,
        user: typeof booking.user === 'object' ? booking.user.id : booking.user,
        program: typeof program === 'object' ? program.id : program,
        round: typeof round === 'object' ? round.id : round,
        booking: booking.id,
        quizScore: quizScore ?? null,
        passingScore: 70,
        issuedAt: new Date().toISOString(),
        verificationUrl: `${appUrl}/certificates/${certCode}`,
      },
    });

    // Mark booking as completed
    await payload.update({
      collection: 'bookings',
      id: bookingId,
      data: { status: 'completed' },
    });

    return NextResponse.json({ certificateCode: cert.certificateCode, verificationUrl: cert.verificationUrl });
  } catch (err) {
    console.error('[certificates/generate]', err);
    return NextResponse.json({ error: 'حصلت مشكلة' }, { status: 500 });
  }
}
