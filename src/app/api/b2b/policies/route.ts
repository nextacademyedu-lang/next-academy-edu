import { NextRequest, NextResponse } from 'next/server';
import { resolveB2BScope, relationToId } from '../_scope.ts';

export async function GET(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const { payload, companyId } = scope;

    const result = await payload.find({
      collection: 'company-policies',
      where: { company: { equals: companyId } },
      depth: 1,
      limit: 1,
      overrideAccess: true,
    });

    const policy = result.docs[0] as unknown as Record<string, unknown> | undefined;

    if (!policy) {
      return NextResponse.json({
        policy: null,
        message: 'No policy configured for this company',
      });
    }

    return NextResponse.json({
      policy: {
        id: String(policy.id),
        allowedPrograms: policy.allowedPrograms || [],
        blockedPrograms: policy.blockedPrograms || [],
        monthlyBudget: policy.monthlyBudget || 0,
        requireApproval: policy.requireApproval || false,
        maxBookingsPerMember: policy.maxBookingsPerMember || 0,
        notes: policy.notes || '',
      },
    });
  } catch (error) {
    console.error('[api/b2b/policies][GET]', error);
    return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const scope = await resolveB2BScope(req);
    if ('error' in scope) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { payload, companyId } = scope;

    // Find existing policy
    const result = await payload.find({
      collection: 'company-policies',
      where: { company: { equals: companyId } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    });

    const existingPolicy = result.docs[0] as { id: number | string } | undefined;

    const data: Record<string, unknown> = {};

    if (Array.isArray(body.allowedPrograms)) {
      data.allowedPrograms = body.allowedPrograms
        .map((id: unknown) => relationToId(id))
        .filter(Boolean);
    }

    if (Array.isArray(body.blockedPrograms)) {
      data.blockedPrograms = body.blockedPrograms
        .map((id: unknown) => relationToId(id))
        .filter(Boolean);
    }

    if (typeof body.monthlyBudget === 'number' && body.monthlyBudget >= 0) {
      data.monthlyBudget = body.monthlyBudget;
    }

    if (typeof body.requireApproval === 'boolean') {
      data.requireApproval = body.requireApproval;
    }

    if (typeof body.maxBookingsPerMember === 'number' && body.maxBookingsPerMember >= 0) {
      data.maxBookingsPerMember = body.maxBookingsPerMember;
    }

    if (typeof body.notes === 'string') {
      data.notes = body.notes.trim();
    }

    let saved: Record<string, unknown>;

    if (existingPolicy) {
      saved = (await payload.update({
        collection: 'company-policies',
        id: existingPolicy.id,
        data: data as any,
        overrideAccess: true,
              })) as unknown as Record<string, unknown>;
    } else {
      saved = (await payload.create({
        collection: 'company-policies',
        data: {
          company: companyId,
          ...data,
        } as any,
        overrideAccess: true,
              })) as unknown as Record<string, unknown>;
    }

    return NextResponse.json({
      policy: {
        id: String(saved.id),
        allowedPrograms: saved.allowedPrograms || [],
        blockedPrograms: saved.blockedPrograms || [],
        monthlyBudget: saved.monthlyBudget || 0,
        requireApproval: saved.requireApproval || false,
        maxBookingsPerMember: saved.maxBookingsPerMember || 0,
        notes: saved.notes || '',
      },
    });
  } catch (error) {
    console.error('[api/b2b/policies][PATCH]', error);
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
  }
}
