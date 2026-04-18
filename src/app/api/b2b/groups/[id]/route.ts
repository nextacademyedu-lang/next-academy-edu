import { NextRequest, NextResponse } from 'next/server';
import { resolveB2BScope, relationToId } from '../../_scope.ts';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
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

    // Verify group belongs to this company
    const groupDoc = await payload
      .findByID({
        collection: 'company-groups',
        id: groupId,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null);

    if (!groupDoc || relationToId(groupDoc.company) !== companyId) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      data.name = body.name.trim();
    }
    if (typeof body.description === 'string') {
      data.description = body.description.trim();
    }
    if (typeof body.seatAllocation === 'number' && body.seatAllocation >= 0) {
      data.seatAllocation = body.seatAllocation;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const updated = await payload.update({
      collection: 'company-groups',
      id: groupId,
      data: data as any,
      overrideAccess: true,
    });

    return NextResponse.json({
      group: {
        id: String(updated.id),
        name: updated.name || '',
        description: updated.description || '',
        seatAllocation: updated.seatAllocation || 0,
      },
    });
  } catch (error) {
    console.error('[api/b2b/groups/[id]][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    // Only admin or b2b_manager can delete groups
    if (scope.user.role !== 'admin' && scope.user.role !== 'b2b_manager') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: groupIdStr } = await context.params;
    const groupId = Number(groupIdStr);
    if (!Number.isFinite(groupId)) {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }

    const { payload, companyId } = scope;

    // Verify group belongs to this company
    const groupDoc = await payload
      .findByID({
        collection: 'company-groups',
        id: groupId,
        depth: 0,
        overrideAccess: true,
      })
      .catch(() => null);

    if (!groupDoc || relationToId(groupDoc.company) !== companyId) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Delete all group members first
    const members = await payload.find({
      collection: 'company-group-members',
      where: { group: { equals: groupId } },
      depth: 0,
      limit: 500,
      overrideAccess: true,
    });

    for (const member of members.docs) {
      await payload.delete({
        collection: 'company-group-members',
        id: (member as { id: number | string }).id,
        overrideAccess: true,
      });
    }

    // Delete the group
    await payload.delete({
      collection: 'company-groups' as 'users',
      id: groupId,
      overrideAccess: true,
    });

    return NextResponse.json({ deleted: true, groupId: String(groupId) });
  } catch (error) {
    console.error('[api/b2b/groups/[id]][DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 });
  }
}
