import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    const payload = await getPayload({ config: configPromise });
    
    const usersRes = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: userId } },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    });

    if (usersRes.docs.length > 0) {
      return NextResponse.json({ user: usersRes.docs[0] });
    }

    return NextResponse.json({ user: null });
  } catch (err) {
    console.error('Error fetching auth user:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
