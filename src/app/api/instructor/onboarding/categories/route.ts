import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type AuthUser = {
  role?: string | null;
};

type CategoryDoc = {
  id: number | string;
  nameAr?: string | null;
  nameEn?: string | null;
  slug?: string | null;
  order?: number | null;
};

export async function GET(req: NextRequest) {
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

    const categoriesResult = await payload.find({
      collection: 'categories',
      where: { isActive: { equals: true } },
      depth: 0,
      limit: 200,
      sort: 'order',
      overrideAccess: true,
          });

    const categories = (categoriesResult.docs as CategoryDoc[]).map((category) => ({
      id: String(category.id),
      nameAr: category.nameAr || '',
      nameEn: category.nameEn || '',
      slug: category.slug || '',
      order: typeof category.order === 'number' ? category.order : 0,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('[api/instructor/onboarding/categories][GET]', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}
