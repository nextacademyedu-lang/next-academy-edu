import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function PUT(req: NextRequest) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await payload.update({
    collection: 'notifications',
    where: { and: [{ user: { equals: user.id } }, { isRead: { equals: false } }] },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
