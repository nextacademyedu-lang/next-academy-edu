import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await getPayload({ config: configPromise });

    const usersRes = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: userId } },
      limit: 1,
      overrideAccess: true,
    });

    if (usersRes.docs.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const payloadUserId = usersRes.docs[0].id;

    const profileRes = await payload.find({
      collection: 'user-profiles',
      where: { user: { equals: payloadUserId } },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    });

    // In Payload, docs is an array. We return it directly so handleResponse maps it to data.
    return NextResponse.json({
      docs: profileRes.docs,
      totalDocs: profileRes.docs.length,
      limit: 1,
      page: 1,
      totalPages: 1
    });
  } catch (err) {
    console.error('Error fetching extended profile:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    if (usersRes.docs.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const payloadUserId = usersRes.docs[0].id;

    const newProfile = await payload.create({
      collection: 'user-profiles',
      data: { ...data, user: payloadUserId },
      overrideAccess: true,
    });

    return NextResponse.json({ doc: newProfile });
  } catch (err) {
    console.error('Error creating extended profile:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    if (usersRes.docs.length === 0) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    const payloadUserId = usersRes.docs[0].id;

    const profileRes = await payload.find({
      collection: 'user-profiles',
      where: { user: { equals: payloadUserId } },
      limit: 1,
      overrideAccess: true,
    });

    if (profileRes.docs.length === 0) return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });

    const updatedProfile = await payload.update({
      collection: 'user-profiles',
      id: profileRes.docs[0].id,
      data,
      overrideAccess: true,
    });

    return NextResponse.json({ doc: updatedProfile });
  } catch (err) {
    console.error('Error updating extended profile:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
