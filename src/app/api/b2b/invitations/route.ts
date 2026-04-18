import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  normalizeInvitationEmail,
  relationToId,
  resolveInvitationStatus,
  type CompanyInvitationDoc,
} from '@/lib/company-invitations';
import { resolveB2BScope } from '../_scope.ts';

const INVITATION_TTL_DAYS = 7;

function sanitizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function resolveCompany(docCompany: unknown, fallbackCompany: { id: number; name: string }) {
  if (docCompany && typeof docCompany === 'object') {
    const id = relationToId((docCompany as { id?: unknown }).id);
    const name =
      typeof (docCompany as { name?: unknown }).name === 'string'
        ? ((docCompany as { name?: string }).name as string)
        : fallbackCompany.name;

    if (id) {
      return { id: String(id), name: name || fallbackCompany.name };
    }
  }

  const id = relationToId(docCompany) || fallbackCompany.id;
  return { id: String(id), name: fallbackCompany.name };
}

function mapInvitation(doc: CompanyInvitationDoc, fallbackCompany: { id: number; name: string }) {
  return {
    id: String(doc.id),
    email: doc.email || '',
    status: resolveInvitationStatus(doc),
    company: resolveCompany(doc.company, fallbackCompany),
    jobTitle: doc.jobTitle || null,
    title: doc.title || null,
    expiresAt: doc.expiresAt || null,
    acceptedAt: doc.acceptedAt || null,
    createdAt: doc.createdAt || null,
    updatedAt: doc.updatedAt || null,
  };
}

function buildAppBaseUrl(req: NextRequest): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  return configured.endsWith('/') ? configured.slice(0, -1) : configured;
}

function sanitizeLocale(input: unknown): 'ar' | 'en' {
  return input === 'en' ? 'en' : 'ar';
}

function buildInviteUrl(req: NextRequest, token: string, locale: 'ar' | 'en') {
  const baseUrl = buildAppBaseUrl(req);
  return `${baseUrl}/${locale}/invite/company?token=${encodeURIComponent(token)}`;
}

async function sendInvitationEmail(params: {
  payload: any;
  to: string;
  companyName: string;
  inviteUrl: string;
  expiresAt: string;
}) {
  const { payload, to, companyName, inviteUrl, expiresAt } = params;
  const expiresText = new Date(expiresAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  await payload.sendEmail({
    to,
    subject: `You're invited to join ${companyName} on Next Academy`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 12px;">Company Invitation</h2>
        <p style="font-size: 14px; line-height: 1.6;">
          You've been invited to join <strong>${companyName}</strong> team on Next Academy.
        </p>
        <p style="font-size: 14px; line-height: 1.6;">
          Click the button below to accept your invitation.
        </p>
        <p style="margin: 20px 0;">
          <a href="${inviteUrl}" style="background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">
            Accept Invitation
          </a>
        </p>
        <p style="font-size: 12px; color: #6b7280;">
          This invitation expires on ${expiresText}. If you did not expect this email, you can ignore it.
        </p>
      </div>
    `,
  });
}

async function createUniqueToken(payload: any, req: NextRequest): Promise<string> {
  for (let i = 0; i < 10; i += 1) {
    const token = crypto.randomBytes(24).toString('hex');
    const existing = await payload.find({
      collection: 'company-invitations',
      where: { token: { equals: token } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
          });

    if (existing.docs.length === 0) return token;
  }

  return `${Date.now().toString(36)}${crypto.randomBytes(8).toString('hex')}`;
}

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }
    const payloadAny = scope.payload as any;

    const statusParam = req.nextUrl.searchParams.get('status') || 'pending';
    const isSpecificStatus =
      statusParam === 'pending' ||
      statusParam === 'accepted' ||
      statusParam === 'revoked' ||
      statusParam === 'expired';

    const where = isSpecificStatus
      ? {
          and: [
            { company: { equals: scope.companyId } },
            { status: { equals: statusParam } },
          ],
        }
      : { company: { equals: scope.companyId } };

    const result = await payloadAny.find({
      collection: 'company-invitations',
      where,
      depth: 1,
      limit: 200,
      sort: '-createdAt',
      overrideAccess: true,
          });

    const docs = result.docs as CompanyInvitationDoc[];

    await Promise.all(
      docs
        .filter((doc) => doc.status === 'pending' && resolveInvitationStatus(doc) === 'expired')
        .map((doc) =>
          payloadAny
            .update({
              collection: 'company-invitations',
              id: doc.id,
              data: { status: 'expired' },
              overrideAccess: true,
                          })
            .catch(() => null),
        ),
    );

    return NextResponse.json({
      docs: docs.map((doc) => mapInvitation(doc, { id: scope.companyId, name: scope.company.name })),
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (error) {
    console.error('[api/b2b/invitations][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }
    const payloadAny = scope.payload as any;

    const inviterId = relationToId(scope.user.id);
    if (!inviterId) {
      return NextResponse.json({ error: 'Invalid inviter context' }, { status: 403 });
    }

    const body = (await req.json().catch(() => null)) as {
      email?: unknown;
      locale?: unknown;
      jobTitle?: unknown;
      title?: unknown;
    } | null;

    const email = normalizeInvitationEmail(body?.email);
    if (!email) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const jobTitle = sanitizeOptionalText(body?.jobTitle);
    const title = sanitizeOptionalText(body?.title);

    if (normalizeInvitationEmail(scope.user && (scope.user as { email?: unknown }).email) === email) {
      return NextResponse.json({ error: 'You cannot invite your own email' }, { status: 400 });
    }

    const existingUserResult = await scope.payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
          });

    if (existingUserResult.docs.length > 0) {
      const existingUser = existingUserResult.docs[0] as { id?: unknown; role?: string | null };
      if (existingUser.role === 'admin') {
        return NextResponse.json(
          { error: 'Admin users cannot be invited as company team members' },
          { status: 403 },
        );
      }

      const existingUserId = relationToId(existingUser.id);
      if (existingUserId) {
        const existingProfileResult = await scope.payload.find({
          collection: 'user-profiles',
          where: { user: { equals: existingUserId } },
          depth: 0,
          limit: 1,
          overrideAccess: true,
                  });

        const profile = existingProfileResult.docs[0] as { id: number | string; company?: unknown } | undefined;
        const companyId = relationToId(profile?.company);
        if (companyId && companyId !== scope.companyId) {
          return NextResponse.json(
            { error: 'User is already linked to another company' },
            { status: 409 },
          );
        }

        if (companyId && companyId === scope.companyId) {
          return NextResponse.json({
            alreadyMember: true,
            email,
            message: 'User is already linked to this company',
          });
        }
      }
    }

    const nowIso = new Date().toISOString();
    const existingPending = await payloadAny.find({
      collection: 'company-invitations',
      where: {
        and: [
          { email: { equals: email } },
          { company: { equals: scope.companyId } },
          { status: { equals: 'pending' } },
          { expiresAt: { greater_than: nowIso } },
        ],
      },
      depth: 1,
      limit: 1,
      overrideAccess: true,
          });

    let invitationDoc: CompanyInvitationDoc | null = null;
    let created = false;

    if (existingPending.docs.length > 0) {
      const existing = existingPending.docs[0] as CompanyInvitationDoc;
      const shouldPatch = Boolean(
        (jobTitle && existing.jobTitle !== jobTitle) || (title && existing.title !== title),
      );

      if (shouldPatch) {
        invitationDoc = (await payloadAny.update({
          collection: 'company-invitations',
          id: existing.id,
          data: {
            ...(jobTitle ? { jobTitle } : {}),
            ...(title ? { title } : {}),
          },
          overrideAccess: true,
                  })) as CompanyInvitationDoc;
      } else {
        invitationDoc = existing;
      }
    } else {
      const token = await createUniqueToken(payloadAny, req);
      const expiresAt = new Date(
        Date.now() + INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();

      invitationDoc = (await payloadAny.create({
        collection: 'company-invitations',
        data: {
          email,
          company: scope.companyId,
          invitedBy: inviterId,
          token,
          status: 'pending',
          expiresAt,
          ...(jobTitle ? { jobTitle } : {}),
          ...(title ? { title } : {}),
        },
        overrideAccess: true,
              })) as CompanyInvitationDoc;
      created = true;
    }

    if (!invitationDoc || !invitationDoc.token) {
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    const locale = sanitizeLocale(body?.locale);
    const inviteUrl = buildInviteUrl(req, invitationDoc.token, locale);

    let emailSent = true;
    try {
      await sendInvitationEmail({
        payload: scope.payload as any,
        to: email,
        companyName: scope.company.name,
        inviteUrl,
        expiresAt: invitationDoc.expiresAt || new Date().toISOString(),
      });
    } catch (error) {
      emailSent = false;
      console.error('[api/b2b/invitations][POST] failed to send invite email', error);
    }

    return NextResponse.json({
      invitation: mapInvitation(invitationDoc, {
        id: scope.companyId,
        name: scope.company.name,
      }),
      created,
      emailSent,
      previewUrl: emailSent ? undefined : inviteUrl,
    });
  } catch (error) {
    console.error('[api/b2b/invitations][POST]', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }
    const payloadAny = scope.payload as any;

    const body = (await req.json().catch(() => null)) as { invitationId?: unknown } | null;
    const invitationId = relationToId(body?.invitationId);

    if (!invitationId) {
      return NextResponse.json({ error: 'invitationId is required' }, { status: 400 });
    }

    const found = await payloadAny.find({
      collection: 'company-invitations',
      where: {
        and: [
          { id: { equals: invitationId } },
          { company: { equals: scope.companyId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
          });

    const invitation = found.docs[0] as CompanyInvitationDoc | undefined;
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending invitations can be revoked' },
        { status: 400 },
      );
    }

    await payloadAny.update({
      collection: 'company-invitations',
      id: invitationId,
      data: {
        status: 'revoked',
        revokedAt: new Date().toISOString(),
      },
      overrideAccess: true,
          });

    return NextResponse.json({ revoked: true, invitationId: String(invitationId) });
  } catch (error) {
    console.error('[api/b2b/invitations][DELETE]', error);
    return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
  }
}
