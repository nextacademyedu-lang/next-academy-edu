import { NextRequest, NextResponse } from 'next/server';
import { getCompanySeatSummary } from '@/lib/b2b-seats';
import { resolveB2BScope } from '../_scope.ts';

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const summary = await getCompanySeatSummary(
      scope.payload as Parameters<typeof getCompanySeatSummary>[0],
      scope.companyId,
    );

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[api/b2b/seats][GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch seat summary' },
      { status: 500 },
    );
  }
}
