import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { auth, currentUser } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: true, data: { user: null } });
    }

    const payload = await getPayload({ config: configPromise });
    
    let usersRes = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: userId } },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    });

    if (usersRes.docs.length > 0) {
      return NextResponse.json({ user: usersRes.docs[0] });
    }

    // Fallback for older users who don't have clerkId set yet
    const clerkUser = await currentUser();
    const primaryEmail = clerkUser?.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (primaryEmail) {
      usersRes = await payload.find({
        collection: 'users',
        where: { email: { equals: primaryEmail.toLowerCase() } },
        depth: 1,
        limit: 1,
        overrideAccess: true,
      });

      if (usersRes.docs.length > 0) {
        const payloadUser = usersRes.docs[0];
        
        // Auto-link
        await payload.update({
          collection: 'users',
          id: payloadUser.id,
          data: { clerkId: userId },
          overrideAccess: true,
        });

        return NextResponse.json({ user: { ...payloadUser, clerkId: userId } });
      }
    }

    return NextResponse.json({ user: null });
  } catch (err) {
    console.error('Error fetching auth user:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
