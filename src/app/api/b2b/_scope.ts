import type { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type PayloadClient = Awaited<ReturnType<typeof getPayload>>;

type AuthUser = {
  id: number | string;
  role?: string | null;
};

type CompanyLite = {
  id: number;
  name: string;
  industry?: string | null;
  size?: string | null;
  type?: string | null;
  country?: string | null;
  city?: string | null;
};

export type B2BScopeError = {
  status: number;
  error: string;
};

export type B2BScope = {
  payload: PayloadClient;
  user: AuthUser;
  companyId: number;
  company: CompanyLite;
};

const PROFILE_PAGE_SIZE = 200;

export function relationToId(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const idValue = (value as { id?: unknown }).id;
    if (typeof idValue === 'number') return idValue;
    if (typeof idValue === 'string') {
      const parsed = Number(idValue);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

function parsePositiveInt(input: string | null, fallback: number, max: number): number {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

export function parsePagination(req: NextRequest, fallbackLimit = 20, maxLimit = 100) {
  const page = parsePositiveInt(req.nextUrl.searchParams.get('page'), 1, 10_000);
  const limit = parsePositiveInt(req.nextUrl.searchParams.get('limit'), fallbackLimit, maxLimit);
  return { page, limit };
}

async function resolveCompanyFromProfile(
  payload: PayloadClient,
  userId: number | string,
): Promise<number | null> {
  const profileResult = await payload.find({
    collection: 'user-profiles',
    where: { user: { equals: userId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });

  const profile = profileResult.docs[0] as { company?: unknown } | undefined;
  return relationToId(profile?.company);
}

export async function resolveB2BScope(req: NextRequest): Promise<B2BScope | B2BScopeError> {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  const authUser = (user || null) as AuthUser | null;

  if (!authUser) {
    return { status: 401, error: 'Unauthorized' };
  }

  const role = authUser.role || 'user';
  if (role !== 'admin' && role !== 'b2b_manager') {
    return { status: 403, error: 'Forbidden' };
  }

  const adminCompanyParam = req.nextUrl.searchParams.get('companyId');
  let companyId: number | null = null;

  if (role === 'admin' && adminCompanyParam) {
    companyId = relationToId(adminCompanyParam);
    if (!companyId) {
      return { status: 400, error: 'Invalid companyId' };
    }
  } else {
    companyId = await resolveCompanyFromProfile(payload, authUser.id);
  }

  if (!companyId && role === 'admin' && !adminCompanyParam) {
    return {
      status: 400,
      error: 'companyId query parameter is required for admin when no profile company is linked',
    };
  }

  if (!companyId) {
    return { status: 403, error: 'No company scope linked to this account' };
  }

  let companyDoc: CompanyLite | null = null;
  try {
    const found = await payload.findByID({
      collection: 'companies',
      id: companyId,
      depth: 0,
      overrideAccess: true,
    });

    companyDoc = {
      id: relationToId((found as { id?: unknown }).id) || companyId,
      name: (found as { name?: string | null }).name || 'Company',
      industry: (found as { industry?: string | null }).industry,
      size: (found as { size?: string | null }).size,
      type: (found as { type?: string | null }).type,
      country: (found as { country?: string | null }).country,
      city: (found as { city?: string | null }).city,
    };
  } catch {
    return { status: 404, error: 'Company not found' };
  }

  return {
    payload,
    user: authUser,
    companyId,
    company: companyDoc,
  };
}

export async function getCompanyUserIds(
  payload: PayloadClient,
  companyId: number,
): Promise<number[]> {
  const userIds = new Set<number>();
  let page = 1;
  let totalPages = 1;

  do {
    const pageResult = await payload.find({
      collection: 'user-profiles',
      where: { company: { equals: companyId } },
      depth: 0,
      limit: PROFILE_PAGE_SIZE,
      page,
      overrideAccess: true,
    });

    totalPages = pageResult.totalPages || 1;

    for (const profile of pageResult.docs as Array<{ user?: unknown }>) {
      const userId = relationToId(profile.user);
      if (userId) userIds.add(userId);
    }

    page += 1;
  } while (page <= totalPages);

  return Array.from(userIds);
}
