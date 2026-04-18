import { NextRequest, NextResponse } from 'next/server';
import { resolveB2BScope, relationToId } from '../_scope.ts';

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, companyId } = scope;

    const groupsResult = await payload.find({
      collection: 'company-groups',
      where: { company: { equals: companyId } },
      sort: 'name',
      depth: 0,
      limit: 100,
      overrideAccess: true,
    });

    // Get member counts for each group
    const groups = await Promise.all(
      (groupsResult.docs as Array<{ id: number | string; name?: string; description?: string; seatAllocation?: number }>).map(
        async (group) => {
          const membersResult = await payload.find({
            collection: 'company-group-members',
            where: { group: { equals: group.id } },
            depth: 0,
            limit: 0,
            overrideAccess: true,
          });

          return {
            id: String(group.id),
            name: group.name || '',
            description: group.description || '',
            seatAllocation: group.seatAllocation || 0,
            memberCount: membersResult.totalDocs,
          };
        },
      ),
    );

    return NextResponse.json({ docs: groups, totalDocs: groupsResult.totalDocs });
  } catch (error) {
    console.error('[api/b2b/groups][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      name?: unknown;
      description?: unknown;
      seatAllocation?: unknown;
    } | null;

    if (!body || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const { payload, companyId, user } = scope;

    // Check duplicate name
    const existing = await payload.find({
      collection: 'company-groups',
      where: {
        and: [
          { company: { equals: companyId } },
          { name: { equals: body.name.trim() } },
        ],
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: 'A group with this name already exists' },
        { status: 409 },
      );
    }

    const data: Record<string, unknown> = {
      name: body.name.trim(),
      company: companyId,
      createdBy: user.id,
    };

    if (typeof body.description === 'string') {
      data.description = body.description.trim();
    }

    if (typeof body.seatAllocation === 'number' && body.seatAllocation >= 0) {
      data.seatAllocation = body.seatAllocation;
    }

    const created = await payload.create({
      collection: 'company-groups',
      data: data as any,
      overrideAccess: true,
          });

    return NextResponse.json({
      group: {
        id: String(created.id),
        name: created.name || '',
        description: created.description || '',
        seatAllocation: created.seatAllocation || 0,
        memberCount: 0,
      },
    });
  } catch (error) {
    console.error('[api/b2b/groups][POST]', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
