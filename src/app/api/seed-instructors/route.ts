/**
 * Seed instructors endpoint.
 *
 * POST /api/seed-instructors
 *
 * Security:
 * - Disabled by default (ENABLE_SEED_ENDPOINTS must be "true")
 * - Requires Authorization: Bearer <CRON_SECRET>
 */
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export const dynamic = 'force-dynamic';

function timingSafeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// ─── Data from consultants table (Supabase export) ─────────────────────────
const consultants = [
  {
    firstName: 'أحمد',
    lastName: 'عثمان',
    slug: 'ahmed-othman',
    jobTitle: 'Marketing Expert',
    tagline: 'التسويق الرقمي واستراتيجيات النمو',
    bioAr: 'خبير تسويق رقمي مع سجل حافل في مساعدة الشركات الناشئة على تحقيق نمو سريع من خلال استراتيجيات تسويقية مبتكرة.',
    bioEn: 'Digital marketing expert with a track record of helping startups achieve rapid growth through innovative marketing strategies.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767190517471-2kdskj6g33x.png',
    featuredOrder: 1,
  },
  {
    firstName: 'صلاح',
    lastName: 'خليل',
    slug: 'salah-khalil',
    jobTitle: 'Commercial Analysis Expert',
    tagline: 'التحليل المالي والتجاري',
    bioAr: 'خبير في التحليل المالي والتجاري مع خبرة واسعة في مساعدة رواد الأعمال على فهم أرقامهم واتخاذ قرارات مالية صحيحة.',
    bioEn: 'Expert in financial and commercial analysis helping entrepreneurs understand their numbers.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    featuredOrder: 2,
  },
  {
    firstName: 'محمد',
    lastName: 'الشيخ',
    slug: 'mohamed-el-sheikh',
    jobTitle: 'Business Strategy Expert',
    tagline: 'استراتيجيات الأعمال',
    bioAr: 'خبير في استراتيجيات الأعمال وبناء عقلية رائد الأعمال الناجح.',
    bioEn: 'Expert in business strategy and building a successful entrepreneurial mindset.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767190653421-upgu96i81ap.png',
    featuredOrder: 3,
  },
  {
    firstName: 'كريم',
    lastName: 'تركي',
    slug: 'karim-turky',
    jobTitle: 'Operations Expert',
    tagline: 'إدارة العمليات والتشغيل',
    bioAr: 'متخصص في إدارة العمليات وتحسين الكفاءة التشغيلية للشركات الناشئة والمتوسطة.',
    bioEn: 'Operations specialist improving operational efficiency for startups and mid-sized companies.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767190630529-0z00toi9osl.png',
    featuredOrder: 4,
  },
  {
    firstName: 'هشام',
    lastName: 'العركي',
    slug: 'hesham-el-arky',
    jobTitle: 'Personal Branding Expert',
    tagline: 'العلامة الشخصية والتواصل',
    bioAr: 'مع خبرتك ومهاراتك، لو العالم مش شايفك، بتفوت فرص كبيرة. تعلم إعادة بناء هويتك المهنية لجذب عملاء أفضل وزيادة دخلك.',
    bioEn: 'Helping professionals rebuild their personal brand identity to attract better clients and increase income.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767190366068-9g46821wvn.png',
    featuredOrder: 5,
  },
  {
    firstName: 'عبدالرحمن',
    lastName: 'قنديل',
    slug: 'abdelrahman-kandeel',
    jobTitle: 'Founder of Next Academy',
    tagline: 'ريادة الأعمال والتحقق من الأفكار',
    bioAr: 'مؤسس Next Academy وخبير في ريادة الأعمال مع خبرة تزيد عن 10 سنوات في مساعدة رواد الأعمال على تحويل أفكارهم إلى مشاريع ناجحة.',
    bioEn: 'Founder of Next Academy and entrepreneurship expert with 10+ years helping entrepreneurs turn ideas into successful ventures.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767190502873-9mawjex543.png',
    featuredOrder: 6,
  },
  {
    firstName: 'محمد',
    lastName: 'الأشول',
    slug: 'mohamed-al-ashwal',
    jobTitle: 'B2B Sales Consultant',
    tagline: 'مبيعات',
    bioAr: 'استشاري متخصص في مبيعات B2B ومساعدة الشركات على بناء خطوط مبيعات فعالة.',
    bioEn: 'B2B Sales consultant helping companies build effective sales pipelines.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767295649119-j34f3r5ixqi.png',
    featuredOrder: 7,
  },
  {
    firstName: 'محمد',
    lastName: 'غنايم',
    slug: 'mohamed-ghanayem',
    jobTitle: 'Management & Training Expert',
    tagline: 'الادارةوالتدريب',
    bioAr: 'خبير تعلم وتطوير يساعد أصحاب الشركات ورواد الأعمال على تحويل فرق العمل إلى محركات نمو، من خلال استراتيجيات تدريب مبنية على احتياجات السوق ونتائج قابلة للقياس.',
    bioEn: 'Learning & development expert helping companies transform their teams into growth engines.',
    imageUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1767480067955-uhpomh88pph.png',
    featuredOrder: 8,
  },
];

// Helper: create a Media doc from an external URL
async function uploadImageFromUrl(
  payload: Awaited<ReturnType<typeof getPayload>>,
  url: string,
  filename: string,
): Promise<number | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    const ext = mimeType.split('/')[1]?.split(';')[0] || 'jpg';

    const media = await payload.create({
      collection: 'media',
      data: { alt: filename },
      file: {
        data: buffer,
        mimetype: mimeType,
        name: `${filename}.${ext}`,
        size: buffer.length,
      },
      overrideAccess: true,
    });
    return media.id as number;
  } catch (err) {
    console.error(`[seed-instructors] Failed to upload ${url}:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Kill-switch: disabled unless explicitly enabled
    if (process.env.ENABLE_SEED_ENDPOINTS !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // CRON_SECRET auth gate
    const configuredSecret = process.env.CRON_SECRET?.trim();
    if (!configuredSecret) {
      return NextResponse.json(
        { error: 'CRON_SECRET is not configured' },
        { status: 503 },
      );
    }

    const incomingAuth = req.headers.get('authorization') || '';
    const expectedAuth = `Bearer ${configuredSecret}`;
    if (!timingSafeEqualString(incomingAuth, expectedAuth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await getPayload({ config });
    const results: string[] = [];

    for (const c of consultants) {
      // Skip if slug already exists
      const existing = await payload.find({
        collection: 'instructors',
        where: { slug: { equals: c.slug } },
        limit: 1,
        overrideAccess: true,
      });
      if (existing.docs.length > 0) {
        results.push(`⏭️ skipped (exists): ${c.slug}`);
        continue;
      }

      // Upload picture
      let pictureId: number | null = null;
      if (c.imageUrl) {
        pictureId = await uploadImageFromUrl(payload, c.imageUrl, `instructor-${c.slug}`);
      }

      await payload.create({
        collection: 'instructors',
        data: {
          firstName: c.firstName,
          lastName: c.lastName,
          slug: c.slug,
          jobTitle: c.jobTitle,
          tagline: c.tagline,
          bioAr: {
            root: {
              type: 'root',
              children: [{ type: 'paragraph', children: [{ type: 'text', text: c.bioAr, version: 1 }], version: 1 }],
              direction: 'rtl',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          bioEn: {
            root: {
              type: 'root',
              children: [{ type: 'paragraph', children: [{ type: 'text', text: c.bioEn, version: 1 }], version: 1 }],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          },
          ...(pictureId ? { picture: pictureId } : {}),
          featuredOrder: c.featuredOrder,
          isActive: true,
        },
        overrideAccess: true,
      });
      results.push(`✅ created: ${c.firstName} ${c.lastName}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[seed-instructors]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
