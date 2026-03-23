import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';
import crypto from 'node:crypto';

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  try {
    if (process.env.ENABLE_TEST_SEED_ENDPOINT !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const configuredSecret = process.env.CRON_SECRET?.trim();
    if (!configuredSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
    }

    const incomingAuth = req.headers.get('authorization') || '';
    const expectedAuth = `Bearer ${configuredSecret}`;
    if (!timingSafeEqualString(incomingAuth, expectedAuth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config });

    // Step 1: Create or find category
    let category;
    const existingCats = await payload.find({
      collection: 'categories',
      where: { slug: { equals: 'test-workshops' } },
      limit: 1,
    });

    if (existingCats.docs.length > 0) {
      category = existingCats.docs[0];
    } else {
      category = await payload.create({
        collection: 'categories',
        data: {
          nameAr: 'ورش تجريبية',
          nameEn: 'Test Workshops',
          slug: 'test-workshops',
          isActive: true,
        },
      });
    }

    // Step 2: Create or find program
    let program;
    const existingProgs = await payload.find({
      collection: 'programs',
      where: { slug: { equals: 'test-payment-workshop' } },
      limit: 1,
    });

    if (existingProgs.docs.length > 0) {
      program = existingProgs.docs[0];
    } else {
      program = await payload.create({
        collection: 'programs',
        data: {
          type: 'workshop',
          titleAr: 'ورشة تجريبية - اختبار الدفع',
          titleEn: 'Test Workshop - Payment Testing',
          slug: 'test-payment-workshop',
          shortDescriptionAr: 'ورشة تجريبية لاختبار نظام الدفع - السعر ١٠ جنيه',
          shortDescriptionEn: 'A test workshop for payment system testing - Price 10 EGP',
          category: category.id,
          durationHours: 2,
          sessionsCount: 1,
          level: 'beginner',
          language: 'ar',
          isFeatured: false,
          isActive: true,
        },
      });
    }

    // Step 3: Create or find round (10 EGP price)
    let round;
    const existingRounds = await payload.find({
      collection: 'rounds',
      where: {
        program: { equals: program.id },
        roundNumber: { equals: 1 },
      },
      limit: 1,
    });

    if (existingRounds.docs.length > 0) {
      round = existingRounds.docs[0];
    } else {
      round = await payload.create({
        collection: 'rounds',
        data: {
          program: program.id,
          roundNumber: 1,
          title: 'الدورة التجريبية #1',
          startDate: '2026-04-01T10:00:00.000Z',
          endDate: '2026-04-01T12:00:00.000Z',
          timezone: 'Africa/Cairo',
          locationType: 'online',
          meetingUrl: 'https://zoom.us/test',
          maxCapacity: 100,
          currentEnrollments: 0,
          price: 10,
          currency: 'EGP',
          status: 'open',
          isActive: true,
        },
      });
    }

    // Step 4: Create or find discount code (9 EGP fixed discount)
    let discountCode;
    const existingCodes = await payload.find({
      collection: 'discount-codes',
      where: { code: { equals: 'TEST9' } },
      limit: 1,
    });

    if (existingCodes.docs.length > 0) {
      discountCode = existingCodes.docs[0];
    } else {
      discountCode = await payload.create({
        collection: 'discount-codes',
        data: {
          code: 'TEST9',
          type: 'fixed',
          value: 9,
          maxUses: 100,
          currentUses: 0,
          validFrom: '2026-03-01T00:00:00.000Z',
          validUntil: '2026-12-31T23:59:59.000Z',
          applicableTo: 'all',
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        category: { id: category.id, slug: 'test-workshops' },
        program: { id: program.id, slug: 'test-payment-workshop', title: 'ورشة تجريبية - اختبار الدفع' },
        round: { id: round.id, price: 10, currency: 'EGP', status: 'open' },
        discountCode: { id: discountCode.id, code: 'TEST9', type: 'fixed', value: 9 },
      },
      summary: {
        testWorkshopPrice: '10 EGP',
        discountCode: 'TEST9 (9 EGP off → final price: 1 EGP)',
        workshopSlug: 'test-payment-workshop',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Seed error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
