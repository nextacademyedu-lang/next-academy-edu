import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import { isAdminRequest } from '@/lib/access-control';
import { asPayloadRequest } from '@/lib/payload-request';
import { enqueueCrmSyncEvent } from '@/lib/crm/queue';
import { createCrmDedupeKey } from '@/lib/crm/dedupe';

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const payloadReq = asPayloadRequest(req);

    // 1. Auth check
    const isAuthorized = await isAdminRequest({ user: (payloadReq as any).user, payload });
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse body
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 3. Fetch user to verify status and gather context
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
      overrideAccess: true,
      req: payloadReq,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admin users are excluded from CRM sync' }, { status: 400 });
    }

    // 4. Queue sync
    const action = 'user_manual_resync';
    const fingerprint = [
      user.updatedAt || user.createdAt || '',
      user.emailVerified ? 'verified' : 'not_verified',
      user.lifecycleStage || '',
      user.role || '',
      'manual_trigger',
    ].join('|');

    const result = await enqueueCrmSyncEvent({
      payload,
      req: payloadReq,
      entityType: 'user',
      entityId: String(user.id),
      action,
      dedupeKey: createCrmDedupeKey({
        entityType: 'user',
        entityId: String(user.id),
        action,
        fingerprint,
      }),
      priority: 20, // Slightly higher than default 50, lower than auto-hooks 10
      sourceCollection: 'users',
      payloadSnapshot: {
        id: user.id,
        email: user.email,
        role: user.role,
        lifecycleStage: user.lifecycleStage,
        emailVerified: user.emailVerified,
        updatedAt: user.updatedAt,
      },
    });

    return NextResponse.json({ 
      success: true, 
      created: result.created, 
      id: result.id,
      message: result.created ? 'Sync event queued' : 'Sync event already pending or deduplicated'
    });
  } catch (error) {
    console.error('[api/admin/crm-resync] failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
