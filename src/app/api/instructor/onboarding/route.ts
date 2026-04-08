import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

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

const AGREEMENT_VERSION = 'v1.0';

interface OnboardingPayload {
  // Step 1: Profile
  profile: {
    firstName: string;
    lastName: string;
    jobTitle?: string;
    tagline?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  };
  // Step 2: First program submission
  program: {
    type: string;
    titleAr: string;
    titleEn?: string;
    shortDescriptionAr: string;
    shortDescriptionEn?: string;
    descriptionAr: string;
    descriptionEn?: string;
    categoryName?: string;
    durationHours?: number;
    sessionsCount: number;
    language?: string;
    level?: string;
    price?: number;
    currency?: string;
    objectivesText?: string;
    requirementsText?: string;
    targetAudienceText?: string;
    extraNotes?: string;
    roundsCount?: number;
  };
  // Step 3: Agreement
  clausesAccepted: string[];
}

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
    if (!program?.titleAr?.trim()) {
      return NextResponse.json({ error: 'Arabic title is required' }, { status: 400 });
    }
    if (!program?.shortDescriptionAr?.trim()) {
      return NextResponse.json({ error: 'Arabic short description is required' }, { status: 400 });
    }
    if (!program?.descriptionAr?.trim()) {
      return NextResponse.json({ error: 'Arabic description is required' }, { status: 400 });
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
        onboardingCompleted: true,
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
        type: program.type || 'course',
        titleAr: program.titleAr.trim(),
        titleEn: program.titleEn?.trim() || undefined,
        shortDescriptionAr: program.shortDescriptionAr.trim(),
        shortDescriptionEn: program.shortDescriptionEn?.trim() || undefined,
        descriptionAr: program.descriptionAr.trim(),
        descriptionEn: program.descriptionEn?.trim() || undefined,
        categoryName: program.categoryName?.trim() || undefined,
        durationHours: program.durationHours || undefined,
        sessionsCount: program.sessionsCount || 1,
        language: program.language || 'ar',
        level: program.level || undefined,
        price: program.price || undefined,
        currency: program.currency || 'EGP',
        objectivesText: program.objectivesText?.trim() || undefined,
        requirementsText: program.requirementsText?.trim() || undefined,
        targetAudienceText: program.targetAudienceText?.trim() || undefined,
        extraNotes: program.extraNotes?.trim() || undefined,
        roundsCount: program.roundsCount || undefined,
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

    return NextResponse.json({ success: true, onboardingCompleted: true });
  } catch (error) {
    console.error('[api/instructor/onboarding][POST]', error);
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 });
  }
}
