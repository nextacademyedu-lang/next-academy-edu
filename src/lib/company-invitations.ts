import type { NextRequest } from 'next/server';

type PayloadClient = any;

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export type CompanyInvitationDoc = {
  id: number | string;
  email?: string | null;
  company?: unknown;
  token?: string | null;
  status?: string | null;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  acceptedBy?: unknown;
  jobTitle?: string | null;
  title?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type UserLite = {
  id: number | string;
  email?: string | null;
  role?: string | null;
  emailVerified?: boolean | null;
};

type UserProfileDoc = {
  id: number | string;
  company?: unknown;
  jobTitle?: string | null;
  title?: string | null;
};

export type AcceptInvitationResult =
  | {
      ok: true;
      invitationId: string;
      companyId: number;
      companyName?: string | null;
      profileId?: string;
      acceptedNow: boolean;
    }
  | {
      ok: false;
      status: number;
      error: string;
      code:
        | 'INVALID_USER'
        | 'FORBIDDEN_ROLE'
        | 'EMAIL_NOT_VERIFIED'
        | 'EMAIL_MISMATCH'
        | 'INVITATION_INVALID'
        | 'INVITATION_EXPIRED'
        | 'INVITATION_REVOKED'
        | 'COMPANY_MISMATCH'
        | 'INVITATION_ACCEPTED';
    };

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

export function normalizeInvitationEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

export function resolveInvitationStatus(doc: CompanyInvitationDoc): InvitationStatus {
  const raw =
    doc.status === 'accepted' || doc.status === 'revoked' || doc.status === 'expired'
      ? doc.status
      : 'pending';

  if (raw !== 'pending') return raw;
  if (!doc.expiresAt) return 'pending';

  const expiresAt = new Date(doc.expiresAt).getTime();
  if (!Number.isFinite(expiresAt)) return 'pending';
  return expiresAt <= Date.now() ? 'expired' : 'pending';
}

export async function markInvitationExpiredIfNeeded(params: {
  payload: PayloadClient;
  req?: NextRequest;
  invitation: CompanyInvitationDoc;
}): Promise<void> {
  const { payload, req, invitation } = params;
  if (resolveInvitationStatus(invitation) !== 'expired') return;
  if (invitation.status === 'expired') return;

  await payload
    .update({
      collection: 'company-invitations',
      id: invitation.id,
      data: { status: 'expired' },
      overrideAccess: true,
    })
    .catch(() => null);
}

export async function findInvitationByToken(params: {
  payload: PayloadClient;
  req?: NextRequest;
  token: string;
  depth?: number;
}): Promise<CompanyInvitationDoc | null> {
  const { payload, req, token, depth = 1 } = params;

  const result = await payload.find({
    collection: 'company-invitations',
    where: { token: { equals: token } },
    depth,
    limit: 1,
    overrideAccess: true,
  });

  return (result.docs[0] as CompanyInvitationDoc | undefined) || null;
}

async function getUserProfile(params: {
  payload: PayloadClient;
  req?: NextRequest;
  userId: number;
}): Promise<UserProfileDoc | null> {
  const { payload, req, userId } = params;
  const result = await payload.find({
    collection: 'user-profiles',
    where: { user: { equals: userId } },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });

  return (result.docs[0] as UserProfileDoc | undefined) || null;
}

async function upsertUserProfileCompany(params: {
  payload: PayloadClient;
  req?: NextRequest;
  userId: number;
  companyId: number;
  invitation?: CompanyInvitationDoc;
}): Promise<{ ok: true; profileId: string } | { ok: false }> {
  const { payload, req, userId, companyId, invitation } = params;
  const profile = await getUserProfile({ payload, req, userId });
  const profileCompanyId = relationToId(profile?.company);

  if (profileCompanyId && profileCompanyId !== companyId) {
    return { ok: false };
  }

  const invitationJobTitle =
    typeof invitation?.jobTitle === 'string' ? invitation.jobTitle.trim() : '';
  const invitationTitle = typeof invitation?.title === 'string' ? invitation.title.trim() : '';

  if (profile) {
    const updateData: Record<string, unknown> = {};
    if (!profileCompanyId) updateData.company = companyId;
    if (!profile.jobTitle && invitationJobTitle) updateData.jobTitle = invitationJobTitle;
    if (!profile.title && invitationTitle) updateData.title = invitationTitle;

    if (Object.keys(updateData).length > 0) {
      const updated = await payload.update({
        collection: 'user-profiles',
        id: profile.id,
        data: updateData,
        overrideAccess: true,
      });

      return { ok: true, profileId: String(updated.id) };
    }

    return { ok: true, profileId: String(profile.id) };
  }

  const created = await payload.create({
    collection: 'user-profiles',
    data: {
      user: userId,
      company: companyId,
      ...(invitationJobTitle ? { jobTitle: invitationJobTitle } : {}),
      ...(invitationTitle ? { title: invitationTitle } : {}),
    },
    overrideAccess: true,
  });

  return { ok: true, profileId: String(created.id) };
}

async function acceptInvitationRecord(params: {
  payload: PayloadClient;
  req?: NextRequest;
  invitation: CompanyInvitationDoc;
  userId: number;
}): Promise<void> {
  const { payload, req, invitation, userId } = params;
  if (invitation.status === 'accepted' && invitation.acceptedAt) return;

  await payload.update({
    collection: 'company-invitations',
    id: invitation.id,
    data: {
      status: 'accepted',
      acceptedAt: new Date().toISOString(),
      acceptedBy: userId,
    },
    overrideAccess: true,
  });
}

export async function acceptCompanyInvitation(params: {
  payload: PayloadClient;
  req?: NextRequest;
  invitation: CompanyInvitationDoc;
  user: UserLite;
  skipEmailMatch?: boolean;
  requireVerifiedEmail?: boolean;
}): Promise<AcceptInvitationResult> {
  const {
    payload,
    req,
    invitation,
    user,
    skipEmailMatch = false,
    requireVerifiedEmail = true,
  } = params;

  const userId = relationToId(user.id);
  if (!userId) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid user context',
      code: 'INVALID_USER',
    };
  }

  if (user.role === 'admin') {
    return {
      ok: false,
      status: 403,
      error: 'Admin users cannot accept company invitations',
      code: 'FORBIDDEN_ROLE',
    };
  }

  if (requireVerifiedEmail && !user.emailVerified) {
    return {
      ok: false,
      status: 403,
      error: 'Please verify your email first',
      code: 'EMAIL_NOT_VERIFIED',
    };
  }

  const invitationEmail = normalizeInvitationEmail(invitation.email);
  const userEmail = normalizeInvitationEmail(user.email);
  if (!skipEmailMatch && (!invitationEmail || !userEmail || invitationEmail !== userEmail)) {
    return {
      ok: false,
      status: 403,
      error: 'This invitation is not assigned to your email',
      code: 'EMAIL_MISMATCH',
    };
  }

  const companyId = relationToId(invitation.company);
  if (!companyId) {
    return {
      ok: false,
      status: 400,
      error: 'Invalid invitation company',
      code: 'INVITATION_INVALID',
    };
  }

  const status = resolveInvitationStatus(invitation);
  if (status === 'expired') {
    await markInvitationExpiredIfNeeded({ payload, req, invitation });
    return {
      ok: false,
      status: 400,
      error: 'Invitation has expired',
      code: 'INVITATION_EXPIRED',
    };
  }

  if (status === 'revoked') {
    return {
      ok: false,
      status: 400,
      error: 'Invitation was revoked',
      code: 'INVITATION_REVOKED',
    };
  }

  const profileResult = await upsertUserProfileCompany({
    payload,
    req,
    userId,
    companyId,
    invitation,
  });

  if (!profileResult.ok) {
    return {
      ok: false,
      status: 409,
      error: 'Your account is already linked to another company',
      code: 'COMPANY_MISMATCH',
    };
  }

  const wasAlreadyAccepted = status === 'accepted';
  await acceptInvitationRecord({ payload, req, invitation, userId });

  const companyName =
    invitation.company && typeof invitation.company === 'object'
      ? ((invitation.company as { name?: string | null }).name ?? null)
      : null;

  return {
    ok: true,
    invitationId: String(invitation.id),
    companyId,
    companyName,
    profileId: profileResult.profileId,
    acceptedNow: !wasAlreadyAccepted,
  };
}

export async function autoAcceptInvitationByEmail(params: {
  payload: PayloadClient;
  req?: NextRequest;
  user: UserLite;
}): Promise<{ accepted: boolean; invitationId?: string; companyId?: number }> {
  const { payload, req, user } = params;
  const normalizedEmail = normalizeInvitationEmail(user.email);
  if (!normalizedEmail || !user.emailVerified) return { accepted: false };

  const pendingInvites = await payload.find({
    collection: 'company-invitations',
    where: {
      and: [
        { email: { equals: normalizedEmail } },
        { status: { equals: 'pending' } },
      ],
    },
    sort: '-createdAt',
    depth: 1,
    limit: 20,
    overrideAccess: true,
  });

  const docs = pendingInvites.docs as CompanyInvitationDoc[];
  for (const invitation of docs) {
    const result = await acceptCompanyInvitation({
      payload,
      req,
      invitation,
      user,
      skipEmailMatch: true,
      requireVerifiedEmail: true,
    });

    if (result.ok) {
      return {
        accepted: true,
        invitationId: result.invitationId,
        companyId: result.companyId,
      };
    }

    if (result.code === 'INVITATION_EXPIRED') continue;
    if (result.code === 'INVITATION_REVOKED') continue;
    if (result.code === 'INVITATION_INVALID') continue;
    if (result.code === 'COMPANY_MISMATCH') return { accepted: false };
  }

  return { accepted: false };
}
