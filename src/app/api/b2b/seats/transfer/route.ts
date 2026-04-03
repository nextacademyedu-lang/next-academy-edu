import { NextRequest, NextResponse } from 'next/server';
import { transferSeat } from '@/lib/b2b-seats';
import { resolveB2BScope, relationToId } from '../../_scope.ts';

export async function POST(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as {
      fromUserId?: unknown;
      toUserId?: unknown;
      allocationId?: unknown;
    } | null;

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const fromUserId = relationToId(body.fromUserId);
    const toUserId = relationToId(body.toUserId);
    const allocationId = relationToId(body.allocationId);

    if (!fromUserId || !toUserId || !allocationId) {
      return NextResponse.json(
        { error: 'fromUserId, toUserId, and allocationId are required' },
        { status: 400 },
      );
    }

    const result = await transferSeat(
      scope.payload as Parameters<typeof transferSeat>[0],
      {
        companyId: scope.companyId,
        fromUserId,
        toUserId,
        allocationId,
      },
    );

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      transferred: true,
      allocationId: String(result.allocationId),
    });
  } catch (error) {
    console.error('[api/b2b/seats/transfer][POST]', error);
    return NextResponse.json(
      { error: 'Failed to transfer seat' },
      { status: 500 },
    );
  }
}
