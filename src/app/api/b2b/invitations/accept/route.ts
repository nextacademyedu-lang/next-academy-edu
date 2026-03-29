import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  acceptCompanyInvitation,
  findInvitationByToken,
  markInvitationExpiredIfNeeded,
  type CompanyInvitationDoc,
} from '@/lib/company-invitations';

type AuthUser = {
  id: number | string;
  email?: string | null;
  role?: string | null;
  emailVerified?: boolean | null;
};

function mapAcceptedInvitation(invitation: CompanyInvitationDoc) {
  const company = invitation.company as { id?: unknown; name?: string } | null;
  return {
    id: String(invitation.id),
    email: invitation.email || '',
    company: company
      ? {
          id: company.id ? String(company.id) : null,
          name: company.name || 'Company',
        }
      : null,
    status: 'accepted',
    acceptedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    const authUser = (user || null) as AuthUser | null;

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as { token?: unknown } | null;
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const invitation = await findInvitationByToken({ payload, req, token, depth: 1 });
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    await markInvitationExpiredIfNeeded({ payload, req, invitation });

    const accepted = await acceptCompanyInvitation({
      payload,
      req,
      invitation,
      user: authUser,
      requireVerifiedEmail: true,
    });

    if (!accepted.ok) {
      return NextResponse.json({ error: accepted.error, code: accepted.code }, { status: accepted.status });
    }

    return NextResponse.json({
      accepted: true,
      invitation: mapAcceptedInvitation(invitation),
      companyId: String(accepted.companyId),
      acceptedNow: accepted.acceptedNow,
    });
  } catch (error) {
    console.error('[api/b2b/invitations/accept][POST]', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}
