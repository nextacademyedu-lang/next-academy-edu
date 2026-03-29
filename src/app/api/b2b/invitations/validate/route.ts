import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import {
  findInvitationByToken,
  markInvitationExpiredIfNeeded,
  relationToId,
  resolveInvitationStatus,
} from '@/lib/company-invitations';

function mapCompany(invitationCompany: unknown) {
  if (!invitationCompany || typeof invitationCompany !== 'object') {
    const id = relationToId(invitationCompany);
    return id ? { id: String(id), name: 'Company' } : null;
  }

  const id = relationToId((invitationCompany as { id?: unknown }).id);
  const name =
    typeof (invitationCompany as { name?: unknown }).name === 'string'
      ? (invitationCompany as { name: string }).name
      : 'Company';

  if (!id) return { id: null, name };
  return { id: String(id), name };
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')?.trim();
    if (!token) {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const payload = await getPayload({ config });
    const invitation = await findInvitationByToken({
      payload,
      req,
      token,
      depth: 1,
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    await markInvitationExpiredIfNeeded({ payload, req, invitation });
    const status = resolveInvitationStatus(invitation);

    return NextResponse.json({
      invitation: {
        id: String(invitation.id),
        email: invitation.email || '',
        status,
        company: mapCompany(invitation.company),
        jobTitle: invitation.jobTitle || null,
        title: invitation.title || null,
        expiresAt: invitation.expiresAt || null,
        acceptedAt: invitation.acceptedAt || null,
        createdAt: invitation.createdAt || null,
      },
      canAccept: status === 'pending',
    });
  } catch (error) {
    console.error('[api/b2b/invitations/validate][GET]', error);
    return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 });
  }
}
