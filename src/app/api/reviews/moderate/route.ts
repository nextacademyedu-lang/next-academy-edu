import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

type Action = 'approve' | 'flag' | 'remove';

export async function POST(req: NextRequest) {
  try {
    const { reviewId, action, reason } = await req.json() as {
      reviewId: string;
      action: Action;
      reason?: string;
    };

    if (!reviewId || !['approve', 'flag', 'remove'].includes(action)) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const payload = await getPayload({ config });

    // Admin only
    const { user } = await payload.auth({ headers: req.headers });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const statusMap: Record<Action, string> = {
      approve: 'approved',
      flag: 'flagged',
      remove: 'removed',
    };

    await payload.update({
      collection: 'reviews',
      id: reviewId,
      data: {
        status: statusMap[action],
        adminNotes: reason,
        removedReason: action === 'remove' ? reason : undefined,
      },
    });

    // Recalculate program average rating after approve/remove
    if (action === 'approve' || action === 'remove') {
      const review = await payload.findByID({ collection: 'reviews', id: reviewId });
      const programId = typeof review.program === 'object' ? review.program.id : review.program;

      const approvedReviews = await payload.find({
        collection: 'reviews',
        where: {
          program: { equals: programId },
          status: { equals: 'approved' },
        },
        limit: 1000,
      });

      const count = approvedReviews.totalDocs;
      const avg = count > 0
        ? approvedReviews.docs.reduce((sum, r) => sum + r.rating, 0) / count
        : 0;

      await payload.update({
        collection: 'programs',
        id: programId,
        data: {
          averageRating: Math.round(avg * 10) / 10,
          reviewCount: count,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reviews/moderate]', err);
    return NextResponse.json({ error: 'حصلت مشكلة' }, { status: 500 });
  }
}
