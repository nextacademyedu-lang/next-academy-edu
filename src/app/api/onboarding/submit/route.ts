import { NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config });
    const data = await req.json();
    const { step1, step3, role } = data;

    // 1. Resolve Company ID (Find or Create)
    let companyId: number | undefined = undefined;
    if (step1.company?.trim()) {
      const companyName = step1.company.trim();
      
      const findRes = await payload.find({
        collection: 'companies',
        where: { name: { equals: companyName } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });

      if (findRes.docs.length > 0) {
        companyId = findRes.docs[0].id as number;
      } else {
        const newCompany = await payload.create({
          collection: 'companies',
          data: {
            name: companyName,
            size: step1.companySize || undefined,
          },
          overrideAccess: true,
        });
        companyId = newCompany.id as number;
      }
    }

    // 2. Find or Create Payload User
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const firstName = clerkUser.firstName || step1.firstName || 'User';
    const lastName = clerkUser.lastName || step1.lastName || '';

    const usersRes = await payload.find({
      collection: 'users',
      where: { clerkId: { equals: userId } },
      limit: 1,
      overrideAccess: true,
    });

    let payloadUser;
    
    if (usersRes.docs.length > 0) {
      payloadUser = usersRes.docs[0];
      
      // Update phone and gender if provided
      await payload.update({
        collection: 'users',
        id: payloadUser.id,
        data: {
          phone: step1.phone?.trim() || payloadUser.phone,
          gender: step1.gender ? step1.gender.toLowerCase() : payloadUser.gender,
        },
        overrideAccess: true,
      });
    } else {
      // Find by email fallback just in case
      const existingEmailRes = await payload.find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
      });
      
      if (existingEmailRes.docs.length > 0) {
        payloadUser = existingEmailRes.docs[0];
        // Link the clerkId
        await payload.update({
          collection: 'users',
          id: payloadUser.id,
          data: { clerkId: userId },
          overrideAccess: true,
        });
      } else {
        payloadUser = await payload.create({
          collection: 'users',
          data: {
            email,
            firstName,
            lastName,
            clerkId: userId,
            password: crypto.randomUUID(),
            role: role || 'user',
            signupIntent: role === 'instructor' ? 'instructor' : 'student',
            phone: step1.phone?.trim() || undefined,
            gender: step1.gender ? step1.gender.toLowerCase() : undefined,
            emailVerified: true,
          },
          overrideAccess: true,
        });
      }
    }

    // 3. Resolve Work Field
    const finalWorkField =
      step1.workField === 'Other' && step1.workFieldOther
        ? step1.workFieldOther
        : step1.workField;

    // 4. Update or Create User Profile
    const profileRes = await payload.find({
      collection: 'user-profiles',
      where: { user: { equals: payloadUser.id } },
      limit: 1,
      overrideAccess: true,
    });

    const profileData = {
      title: step1.title || undefined,
      jobTitle: step1.jobTitle || undefined,
      workField: finalWorkField || undefined,
      yearsOfExperience: step1.yearsOfExperience || undefined,
      country: step1.country || undefined,
      city: step1.city || undefined,
      company: companyId,
      learningGoals: step3?.learningGoals || undefined,
      howDidYouHear: step3?.howDidYouHear === 'Other' ? step3?.howDidYouHearOther : step3?.howDidYouHear,
    };

    if (profileRes.docs.length > 0) {
      await payload.update({
        collection: 'user-profiles',
        id: profileRes.docs[0].id,
        data: profileData,
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: 'user-profiles',
        data: {
          user: payloadUser.id,
          ...profileData,
        },
        overrideAccess: true,
      });
    }

    // 5. Update Clerk User Metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
        payloadUserId: payloadUser.id,
        role: role || 'user',
      }
    });

    return NextResponse.json({ success: true, payloadUserId: payloadUser.id });
  } catch (error) {
    console.error('Onboarding sync error:', error);
    return NextResponse.json({ error: 'Failed to sync onboarding data' }, { status: 500 });
  }
}
