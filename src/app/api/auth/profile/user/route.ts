import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { auth } from '@clerk/nextjs/server';

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const payload = await getPayload({ config: configPromise });

    const usersRes = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: userId } },
      limit: 1,
      overrideAccess: true,
    });

    if (usersRes.docs.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found in CRM' }, { status: 404 });
    }

    const payloadUserId = usersRes.docs[0].id;

    const updatedUser = await payload.update({
      collection: 'users',
      id: payloadUserId,
      data,
      overrideAccess: true,
    });

    return NextResponse.json({ doc: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
