// ⚠️ TEMPORARY ROUTE — DELETE AFTER USE
// Resets admin password directly via Payload Local API
import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();

    // Simple protection — must pass the correct secret
    if (secret !== 'reset-next-academy-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config });

    // Find the user
    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: 'nextacademyedu@gmail.com' } },
      limit: 1,
    });

    if (!docs.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password directly
    await payload.update({
      collection: 'users',
      id: docs[0].id,
      data: {
        password: 'NextAcademy@2026!',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset to: NextAcademy@2026!',
      userId: docs[0].id,
      email: docs[0].email,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
