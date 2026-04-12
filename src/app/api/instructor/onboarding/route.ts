import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { sendInstructorOnboardingSubmitted } from '@/lib/email/instructor-emails';

type AuthUser = {
  role?: string | null;
  instructorId?: unknown;
};

function relationToId(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const rawId = (value as { id?: unknown }).id;
    if (typeof rawId === 'number') return rawId;
    if (typeof rawId === 'string') {
      const parsed = Number(rawId);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

const AGREEMENT_VERSION = 'v1.2';

interface OnboardingPayload {
  // Step 1: Profile
  profile: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    tagline: string;
    linkedinUrl: string;
    twitterUrl?: string;
    pictureId: number | string;
    coverImageId: number | string;
  };
  // Step 2: First program submission
  program: {
    type: string;
    titleAr: string;
    titleEn: string;
    shortDescriptionAr: string;
    shortDescriptionEn: string;
    descriptionAr: string;
    descriptionEn: string;
    categoryName: string;
    durationHours: number;
    sessionsCount: number;
    language: string;
    level: string;
    price: number;
    currency: string;
    objectivesText: string;
    requirementsText: string;
    targetAudienceText: string;
    extraNotes: string;
    roundsCount: number;
    previousTraineesCount: number;
    isFirstTimeProgram: 'yes' | 'no';
    teachingExperienceYears: number;
    deliveryHistoryText: string;
  };
  // Step 3: Agreement
  clausesAccepted: string[];
}

type AuthenticatedUser = {
  id: number | string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  preferredLanguage?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    const authUser = user as AuthUser | null;

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (authUser.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instructorId = relationToId(authUser.instructorId);
    if (!instructorId) {
      return NextResponse.json(
        { error: 'No instructor profile linked to this account' },
        { status: 403 },
      );
    }

    const body = (await req.json().catch(() => null)) as OnboardingPayload | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate required fields
    const { profile, program, clausesAccepted } = body;
    if (!profile?.firstName?.trim() || !profile?.lastName?.trim()) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 });
    }
    if (!profile?.jobTitle?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }
    if (!profile?.tagline?.trim()) {
      return NextResponse.json({ error: 'Tagline is required' }, { status: 400 });
    }
    if (!profile?.linkedinUrl?.trim()) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 });
    }
    const pictureId = relationToId(profile?.pictureId);
    if (!pictureId) {
      return NextResponse.json({ error: 'Profile picture is required' }, { status: 400 });
    }
    const coverImageId = relationToId(profile?.coverImageId);
    if (!coverImageId) {
      return NextResponse.json({ error: 'Cover image is required' }, { status: 400 });
    }
    if (!program?.titleAr?.trim()) {
      return NextResponse.json({ error: 'Arabic title is required' }, { status: 400 });
    }
    if (!program?.titleEn?.trim()) {
      return NextResponse.json({ error: 'English title is required' }, { status: 400 });
    }
    if (!program?.shortDescriptionAr?.trim()) {
      return NextResponse.json({ error: 'Arabic short description is required' }, { status: 400 });
    }
    if (!program?.shortDescriptionEn?.trim()) {
      return NextResponse.json({ error: 'English short description is required' }, { status: 400 });
    }
    if (!program?.descriptionAr?.trim()) {
      return NextResponse.json({ error: 'Arabic description is required' }, { status: 400 });
    }
    if (!program?.descriptionEn?.trim()) {
      return NextResponse.json({ error: 'English description is required' }, { status: 400 });
    }
    if (!program?.categoryName?.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!Number.isFinite(program?.durationHours) || program.durationHours <= 0) {
      return NextResponse.json({ error: 'Duration hours must be greater than 0' }, { status: 400 });
    }
    if (!Number.isFinite(program?.sessionsCount) || program.sessionsCount <= 0) {
      return NextResponse.json({ error: 'Sessions count must be greater than 0' }, { status: 400 });
    }
    if (!Number.isFinite(program?.price) || program.price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }
    if (!program?.currency?.trim()) {
      return NextResponse.json({ error: 'Currency is required' }, { status: 400 });
    }
    if (!program?.language?.trim()) {
      return NextResponse.json({ error: 'Language is required' }, { status: 400 });
    }
    if (!program?.level?.trim()) {
      return NextResponse.json({ error: 'Level is required' }, { status: 400 });
    }
    if (!program?.objectivesText?.trim()) {
      return NextResponse.json({ error: 'Objectives are required' }, { status: 400 });
    }
    if (!program?.requirementsText?.trim()) {
      return NextResponse.json({ error: 'Requirements are required' }, { status: 400 });
    }
    if (!program?.targetAudienceText?.trim()) {
      return NextResponse.json({ error: 'Target audience is required' }, { status: 400 });
    }
    if (!program?.extraNotes?.trim()) {
      return NextResponse.json({ error: 'Extra notes are required' }, { status: 400 });
    }
    if (!Number.isFinite(program?.roundsCount) || program.roundsCount <= 0) {
      return NextResponse.json({ error: 'Rounds count must be greater than 0' }, { status: 400 });
    }
    if (program?.previousTraineesCount == null || !Number.isFinite(program.previousTraineesCount) || program.previousTraineesCount < 0) {
      return NextResponse.json({ error: 'Previous trainees count is required' }, { status: 400 });
    }
    if (program?.isFirstTimeProgram !== 'yes' && program?.isFirstTimeProgram !== 'no') {
      return NextResponse.json({ error: 'First time delivery answer is required' }, { status: 400 });
    }
    if (program?.teachingExperienceYears == null || !Number.isFinite(program.teachingExperienceYears) || program.teachingExperienceYears < 0) {
      return NextResponse.json({ error: 'Teaching experience years are required' }, { status: 400 });
    }
    if (!program?.deliveryHistoryText?.trim()) {
      return NextResponse.json({ error: 'Previous delivery summary is required' }, { status: 400 });
    }
    if (!Array.isArray(clausesAccepted) || clausesAccepted.length < 10) {
      return NextResponse.json(
        { error: 'All agreement clauses must be accepted' },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // 1. Update instructor profile
    await payload.update({
      collection: 'instructors',
      id: instructorId,
      data: {
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        jobTitle: profile.jobTitle?.trim() || undefined,
        tagline: profile.tagline?.trim() || undefined,
        linkedinUrl: profile.linkedinUrl?.trim() || undefined,
        twitterUrl: profile.twitterUrl?.trim() || undefined,
        picture: pictureId,
        coverImage: coverImageId,
        courseRevenueShare: 33,
        onboardingCompleted: true,
        verificationStatus: 'pending',
        submittedAt: now,
        isActive: false,
        agreementAccepted: true,
        agreementAcceptedAt: now,
        agreementVersion: AGREEMENT_VERSION,
      } as any,
      overrideAccess: true,
      req,
      context: { selfServiceInstructorProfile: true },
    });

    // 2. Create program submission
    const userId = typeof user?.id === 'number' ? user.id : Number(user?.id);
    await payload.create({
      collection: 'instructor-program-submissions' as any,
      data: {
        instructor: instructorId,
        submittedBy: userId,
        status: 'pending',
        submittedAt: now,
        type: program.type,
        titleAr: program.titleAr.trim(),
        titleEn: program.titleEn.trim(),
        shortDescriptionAr: program.shortDescriptionAr.trim(),
        shortDescriptionEn: program.shortDescriptionEn.trim(),
        descriptionAr: program.descriptionAr.trim(),
        descriptionEn: program.descriptionEn.trim(),
        categoryName: program.categoryName.trim(),
        durationHours: program.durationHours,
        sessionsCount: program.sessionsCount,
        language: program.language,
        level: program.level,
        price: program.price,
        currency: program.currency,
        objectivesText: program.objectivesText.trim(),
        requirementsText: program.requirementsText.trim(),
        targetAudienceText: program.targetAudienceText.trim(),
        extraNotes: program.extraNotes.trim(),
        roundsCount: program.roundsCount,
        previousTraineesCount: program.previousTraineesCount,
        isFirstTimeProgram: program.isFirstTimeProgram,
        teachingExperienceYears: program.teachingExperienceYears,
        deliveryHistoryText: program.deliveryHistoryText.trim(),
      } as any,
      overrideAccess: true,
      req,
    });

    // 3. Create agreement audit record
    await payload.create({
      collection: 'instructor-agreements' as any,
      data: {
        instructor: instructorId,
        version: AGREEMENT_VERSION,
        acceptedAt: now,
        clausesAccepted: clausesAccepted,
      } as any,
      overrideAccess: true,
      req,
    });

    const authenticatedUser = user as AuthenticatedUser;
    if (authenticatedUser?.email) {
      try {
        await sendInstructorOnboardingSubmitted({
          to: authenticatedUser.email,
          userName:
            `${authenticatedUser.firstName || ''} ${authenticatedUser.lastName || ''}`.trim() ||
            authenticatedUser.email,
          programTitle: program.titleAr.trim() || program.titleEn.trim(),
          locale: authenticatedUser.preferredLanguage,
        });
      } catch (emailError) {
        console.error('[api/instructor/onboarding][POST] onboarding email failed:', emailError);
      }
    }

    return NextResponse.json({ success: true, onboardingCompleted: true });
  } catch (error) {
    console.error('[api/instructor/onboarding][POST]', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
