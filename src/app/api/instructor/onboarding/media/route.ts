import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type AuthUser = {
  role?: string | null;
  instructorId?: unknown;
};

function relationToId(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (value && typeof value === 'object' && 'id' in value) {
    const rawId = (value as { id?: unknown }).id;
    if (typeof rawId === 'number') return rawId;
    if (typeof rawId === 'string') {
      const parsed = Number(rawId);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: req.headers });
    const authUser = user as AuthUser | null;

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (authUser.role !== 'instructor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const instructorId = relationToId(authUser.instructorId);
    if (!instructorId) {
      return NextResponse.json(
        { error: 'No instructor profile linked to this account' },
        { status: 403 },
      );
    }

    const formData = await req.formData();
    const field = formData.get('field');
    const file = formData.get('file');

    if (field !== 'picture' && field !== 'coverImage') {
      return NextResponse.json({ error: 'Invalid media field' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    if (!buffer.length) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }

    const created = await payload.create({
      collection: 'media',
      data: {
        alt: `${field === 'picture' ? 'Instructor profile picture' : 'Instructor cover image'} #${instructorId}`,
      },
      file: {
        data: buffer,
        mimetype: file.type || 'application/octet-stream',
        name: file.name || `${field}-${Date.now()}`,
        size: buffer.length,
      },
      overrideAccess: true,
      req,
    });

    const createdRecord = created as unknown as {
      id: unknown;
      url?: unknown;
      filename?: unknown;
    };
    const mediaId = relationToId(createdRecord.id);
    if (!mediaId) {
      return NextResponse.json({ error: 'Failed to store media file' }, { status: 500 });
    }

    await payload.update({
      collection: 'instructors',
      id: instructorId,
      data: { [field]: mediaId } as Record<string, unknown>,
      overrideAccess: true,
      req,
      context: { selfServiceInstructorProfile: true },
    });

    return NextResponse.json({
      field,
      media: {
        id: String(mediaId),
        url: typeof createdRecord.url === 'string' ? createdRecord.url : null,
        filename: typeof createdRecord.filename === 'string' ? createdRecord.filename : file.name,
      },
    });
  } catch (error) {
    console.error('[api/instructor/onboarding/media][POST]', error);
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
  }
}
