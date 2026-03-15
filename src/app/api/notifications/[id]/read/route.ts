import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: req.headers });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const doc = await payload.findByID({ collection: 'notifications', id });
  const notifUser = typeof doc.user === 'object' ? doc.user?.id : doc.user;
  if (String(notifUser) !== String(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await payload.update({ collection: 'notifications', id, data: { isRead: true } });

  return NextResponse.json({ success: true });
}
