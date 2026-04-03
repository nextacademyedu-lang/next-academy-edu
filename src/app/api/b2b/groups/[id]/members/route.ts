import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@/payload-types';
import { resolveB2BScope, relationToId } from '../../../_scope.ts';

type RouteContext = { params: Promise<{ id: string }> };

async function verifyGroupOwnership(
  payload: Awaited<ReturnType<typeof import('payload').getPayload>>,
  groupId: number,
  companyId: number,
): Promise<Record<string, unknown> | null> {
  try {
    const groupDoc = await payload.findByID({
      collection: 'company-groups',
      id: groupId,
      depth: 0,
      overrideAccess: true,
    });

    if (!groupDoc) return null;
    const groupCompanyId = relationToId(groupDoc.company);
    return groupCompanyId === companyId ? (groupDoc as unknown as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: groupIdStr } = await context.params;
    const groupId = Number(groupIdStr);
    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const { payload, companyId } = scope;

    const group = await verifyGroupOwnership(payload, groupId, companyId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const membersResult = await payload.find({
      collection: 'company-group-members',
      where: { group: { equals: groupId } },
      depth: 1,
      limit: 200,
      overrideAccess: true,
    });

    const members = (
      membersResult.docs as Array<{
        id: number | string;
        user?: unknown;
        role?: string;
      }>
    ).map((m) => {
      const user = m.user as User | number | null;
      const userInfo =
        user && typeof user === 'object'
          ? {
              id: String(user.id),
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
            }
          : { id: String(user || ''), firstName: '', lastName: '', email: '' };

      return {
        id: String(m.id),
        user: userInfo,
        role: m.role || 'member',
      };
    });

    return NextResponse.json({
      docs: members,
      totalDocs: membersResult.totalDocs,
    });
  } catch (error) {
    console.error('[api/b2b/groups/[id]/members][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch group members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: groupIdStr } = await context.params;
    const groupId = Number(groupIdStr);
    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as {
      userId?: unknown;
      role?: unknown;
    } | null;

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const userId = relationToId(body.userId);
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const role = body.role === 'admin' ? 'admin' : 'member';

    const { payload, companyId, user } = scope;

    // Verify group belongs to company
    const group = await verifyGroupOwnership(payload, groupId, companyId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Verify user belongs to company
    const profileResult = await payload.find({
      collection: 'user-profiles',
      where: {
        and: [
          { user: { equals: userId } },
          { company: { equals: companyId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    if (profileResult.docs.length === 0) {
      return NextResponse.json(
        { error: 'User does not belong to this company' },
        { status: 403 },
      );
    }

    // Check duplicate
    const existingMember = await payload.find({
      collection: 'company-group-members',
      where: {
        and: [
          { group: { equals: groupId } },
          { user: { equals: userId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    if (existingMember.docs.length > 0) {
      return NextResponse.json(
        { error: 'User is already a member of this group' },
        { status: 409 },
      );
    }

    const created = await payload.create({
      collection: 'company-group-members',
      data: {
        user: userId,
        group: groupId,
        role,
        addedBy: user.id,
      } as any,
      overrideAccess: true,
      req,
    });

    return NextResponse.json({
      member: {
        id: String(created.id),
        userId: String(userId),
        role,
      },
      created: true,
    });
  } catch (error) {
    console.error('[api/b2b/groups/[id]/members][POST]', error);
    return NextResponse.json({ error: 'Failed to add group member' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { id: groupIdStr } = await context.params;
    const groupId = Number(groupIdStr);
    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as { userId?: unknown } | null;
    const userId = relationToId(body?.userId);
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { payload, companyId } = scope;

    // Verify group belongs to company
    const group = await verifyGroupOwnership(payload, groupId, companyId);
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Find member record
    const memberResult = await payload.find({
      collection: 'company-group-members',
      where: {
        and: [
          { group: { equals: groupId } },
          { user: { equals: userId } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    const memberDoc = memberResult.docs[0] as { id: number | string } | undefined;
    if (!memberDoc) {
      return NextResponse.json({ error: 'Member not found in this group' }, { status: 404 });
    }

    await payload.delete({
      collection: 'company-group-members',
      id: memberDoc.id,
      overrideAccess: true,
      req,
    });

    return NextResponse.json({
      removed: true,
      userId: String(userId),
      groupId: String(groupId),
    });
  } catch (error) {
    console.error('[api/b2b/groups/[id]/members][DELETE]', error);
    return NextResponse.json({ error: 'Failed to remove group member' }, { status: 500 });
  }
}
