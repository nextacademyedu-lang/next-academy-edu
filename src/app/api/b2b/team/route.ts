import { NextRequest, NextResponse } from 'next/server';
import type { Booking, User, UserProfile } from '@/payload-types';
import {
  parsePagination,
  relationToId,
  resolveB2BScope,
} from '../_scope.ts';

const TRACKED_BOOKING_STATUSES: Booking['status'][] = [
  'reserved',
  'pending',
  'confirmed',
  'completed',
];

function mapTeamUser(userRelation: UserProfile['user']) {
  if (typeof userRelation === 'number') {
    return {
      id: String(userRelation),
      firstName: 'User',
      lastName: String(userRelation),
      email: '',
    };
  }

  const user = userRelation as User;
  return {
    id: String(user.id),
    firstName: user.firstName || 'User',
    lastName: user.lastName || '',
    email: user.email || '',
  };
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

async function fetchUserBookingStats(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  userIds: number[],
) {
  const stats = new Map<number, { bookingsCount: number; lastBookingDate?: string }>();
  if (!userIds.length) return stats;

  let page = 1;
  let totalPages = 1;

  do {
    const result = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { user: { in: userIds } },
          { status: { in: TRACKED_BOOKING_STATUSES } },
        ],
      },
      sort: '-createdAt',
      depth: 0,
      limit: 200,
      page,
      overrideAccess: true,
    });

    for (const booking of result.docs as Booking[]) {
      const userId = relationToId(booking.user);
      if (!userId) continue;

      const prev = stats.get(userId) || { bookingsCount: 0 };
      const lastBookingDate =
        !prev.lastBookingDate || new Date(booking.createdAt) > new Date(prev.lastBookingDate)
          ? booking.createdAt
          : prev.lastBookingDate;

      stats.set(userId, {
        bookingsCount: prev.bookingsCount + 1,
        lastBookingDate,
      });
    }

    totalPages = result.totalPages || 1;
    page += 1;
  } while (page <= totalPages);

  return stats;
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, companyId } = scope;
    const { page, limit } = parsePagination(req, 20, 100);

    const teamResult = await payload.find({
      collection: 'user-profiles',
      where: { company: { equals: companyId } },
      sort: '-updatedAt',
      depth: 1,
      limit,
      page,
      overrideAccess: true,
    });

    const pageUserIds = (teamResult.docs as UserProfile[])
      .map((profile) => relationToId(profile.user))
      .filter((id): id is number => Boolean(id));

    const bookingStats = await fetchUserBookingStats(payload, pageUserIds);

    const docs = (teamResult.docs as UserProfile[]).map((profile) => {
      const user = mapTeamUser(profile.user);
      const userId = relationToId(profile.user);
      const stats = userId ? bookingStats.get(userId) : undefined;

      return {
        user,
        profile: {
          jobTitle: profile.jobTitle || undefined,
          title: profile.title || undefined,
        },
        bookings_count: stats?.bookingsCount || 0,
        last_booking_date: stats?.lastBookingDate,
      };
    });

    return NextResponse.json({
      docs,
      totalDocs: teamResult.totalDocs,
      limit: teamResult.limit,
      page: teamResult.page,
      totalPages: teamResult.totalPages,
    });
  } catch (error) {
    console.error('[api/b2b/team]', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B team data' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const requestedUserId = relationToId(body.userId);
    const requestedEmail = normalizeEmail(body.email);
    const firstName = sanitizeText(body.firstName);
    const lastName = sanitizeText(body.lastName);
    const password = typeof body.password === 'string' ? body.password : '';
    const jobTitle = sanitizeText(body.jobTitle);
    const title = sanitizeText(body.title);

    if (!requestedUserId && !requestedEmail) {
      return NextResponse.json(
        { error: 'userId or email is required' },
        { status: 400 },
      );
    }

    const { payload, companyId } = scope;

    let userDoc: User | null = null;

    if (requestedUserId) {
      const found = await payload.findByID({
        collection: 'users',
        id: requestedUserId,
        depth: 0,
        overrideAccess: true,
              }).catch(() => null);

      if (!found) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      userDoc = found as User;
    } else if (requestedEmail) {
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: requestedEmail } },
        depth: 0,
        limit: 1,
        overrideAccess: true,
              });

      if (existing.docs.length > 0) {
        userDoc = existing.docs[0] as User;
      } else {
        if (!firstName || !lastName || password.length < 8) {
          return NextResponse.json(
            {
              error:
                'For new users, firstName, lastName, and password (min 8 chars) are required',
            },
            { status: 400 },
          );
        }

        const created = await payload.create({
          collection: 'users',
          data: {
            email: requestedEmail,
            firstName,
            lastName,
            password,
            role: 'user',
            signupIntent: 'student',
          },
          overrideAccess: true,
          context: { allowPrivilegedRoleWrite: true },
        });
        userDoc = created as User;
      }
    }

    if (!userDoc) {
      return NextResponse.json({ error: 'Unable to resolve user' }, { status: 500 });
    }

    if (userDoc.role === 'admin') {
      return NextResponse.json(
        { error: 'Admin users cannot be added to company team members' },
        { status: 403 },
      );
    }

    const userId = relationToId(userDoc.id);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }

    const existingProfileResult = await payload.find({
      collection: 'user-profiles',
      where: { user: { equals: userId } },
      depth: 1,
      limit: 1,
      overrideAccess: true,
          });

    const existingProfile = (existingProfileResult.docs[0] as UserProfile | undefined) || null;
    const existingCompanyId = relationToId(existingProfile?.company);
    if (existingCompanyId && existingCompanyId !== companyId) {
      return NextResponse.json(
        { error: 'User is already linked to another company' },
        { status: 409 },
      );
    }

    const profileData: Record<string, unknown> = {
      company: companyId,
    };
    if (jobTitle !== undefined) profileData.jobTitle = jobTitle;
    if (title !== undefined) profileData.title = title;

    let savedProfile: UserProfile;
    if (existingProfile) {
      const updated = await payload.update({
        collection: 'user-profiles',
        id: existingProfile.id,
        data: profileData,
        overrideAccess: true,
              });
      savedProfile = updated as UserProfile;
    } else {
      const created = await payload.create({
        collection: 'user-profiles',
        data: {
          user: userId,
          ...profileData,
        },
        overrideAccess: true,
              });
      savedProfile = created as UserProfile;
    }

    const member = {
      user: mapTeamUser(savedProfile.user),
      profile: {
        jobTitle: savedProfile.jobTitle || undefined,
        title: savedProfile.title || undefined,
      },
      bookings_count: 0,
      last_booking_date: undefined as string | undefined,
    };

    return NextResponse.json({ member, created: !existingProfile });
  } catch (error) {
    console.error('[api/b2b/team][POST]', error);
    return NextResponse.json(
      { error: 'Failed to add team member' },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as { userId?: unknown } | null;
    const userId = relationToId(body?.userId);
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const actorId = relationToId(scope.user.id);
    if (actorId && actorId === userId) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from company scope' },
        { status: 400 },
      );
    }

    const profileResult = await scope.payload.find({
      collection: 'user-profiles',
      where: {
        and: [
          { user: { equals: userId } },
          { company: { equals: scope.companyId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
          });

    const profile = profileResult.docs[0] as UserProfile | undefined;
    if (!profile) {
      return NextResponse.json(
        { error: 'Team member not found in your company' },
        { status: 404 },
      );
    }

    await scope.payload.update({
      collection: 'user-profiles',
      id: profile.id,
      data: { company: null },
      overrideAccess: true,
          });

    return NextResponse.json({ removed: true, userId: String(userId) });
  } catch (error) {
    console.error('[api/b2b/team][DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 },
    );
  }
}
