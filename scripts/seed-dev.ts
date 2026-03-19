/**
 * Dev Seed Script — seeds realistic sample data for local development.
 *
 * Creates (in order):
 *   0. Media (instructor profile photos)
 *
 *   1. Categories
 *   2. Tags
 *   3. Instructors
 *   4. Instructor user accounts (role = 'instructor')
 *   5. Programs (2 workshops, 1 course, 1 webinar)
 *   6. Rounds (1 per program, upcoming)
 *   7. Sessions (3 sessions per round)
 *
 * Usage:
 *   pnpm seed:dev
 *
 * Add to package.json scripts:
 *   "seed:dev": "node --env-file=.env --env-file=.env.local --import tsx scripts/seed-dev.ts"
 */

import { getPayload } from 'payload';
import type { CollectionSlug, Where } from 'payload';
import config from '../src/payload.config.ts';
import path from 'path';
import { readFile } from 'fs/promises';

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(emoji: string, msg: string) {
  console.log(`${emoji}  ${msg}`);
}

/** Returns existing doc id or creates it, keyed by a unique field. */
async function findOrCreate(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
  where: Where,
  data: Record<string, unknown>,
  labelField = 'slug',
): Promise<number> {
  const result = await payload.find({
    collection,
    where,
    limit: 1,
    overrideAccess: true,
  });

  if (result.docs.length > 0) {
    const label = String(result.docs[0][labelField as keyof typeof result.docs[0]] ?? '');
    log('⏭ ', `${collection} "${label}" already exists — skipping`);
    return Number(result.docs[0].id);
  }

  const doc = await payload.create({
    collection,
    data,
    overrideAccess: true,
  });

  const label = String(doc[labelField as keyof typeof doc] ?? '');
  log('✅', `Created ${collection}: "${label}"`);
  return Number(doc.id);
}

/** Uploads a local image file to the media collection and returns its ID. */
async function uploadPhoto(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filename: string,
  alt: string,
): Promise<number | null> {
  // Check if already uploaded by alt text
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs.length > 0) {
    log('⏭ ', `media "${alt}" already exists — skipping`);
    return Number(existing.docs[0].id);
  }

  const imagesDir = path.resolve(process.cwd(), 'scripts', 'seeds', 'images');
  const filePath = path.join(imagesDir, filename);

  try {
    const buffer = await readFile(filePath);
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data: buffer,
        mimetype: 'image/png',
        name: filename,
        size: buffer.length,
      },
      overrideAccess: true,
    });
    log('✅', `Uploaded media: "${alt}" → ${doc.id}`);
    return Number(doc.id);
  } catch (err) {
    console.warn(`⚠️  Could not upload ${filename}:`, err);
    return null;
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Next Academy — Dev Seed\n');
  const payload = await getPayload({ config });

  // ── 1. Categories ─────────────────────────────────────────────────────────
  log('📁', 'Seeding categories…');

  const catSalesId = await findOrCreate(payload, 'categories',
    { slug: { equals: 'sales' } },
    { nameAr: 'مبيعات', nameEn: 'Sales', slug: 'sales', icon: 'TrendingUp', order: 1, isActive: true },
  );

  const catMarketingId = await findOrCreate(payload, 'categories',
    { slug: { equals: 'marketing' } },
    { nameAr: 'تسويق', nameEn: 'Marketing', slug: 'marketing', icon: 'Megaphone', order: 2, isActive: true },
  );

  const catLeadershipId = await findOrCreate(payload, 'categories',
    { slug: { equals: 'leadership' } },
    { nameAr: 'قيادة', nameEn: 'Leadership', slug: 'leadership', icon: 'Award', order: 3, isActive: true },
  );

  const catFinanceId = await findOrCreate(payload, 'categories',
    { slug: { equals: 'finance' } },
    { nameAr: 'مالية', nameEn: 'Finance', slug: 'finance', icon: 'DollarSign', order: 4, isActive: true },
  );

  // ── 2. Tags ────────────────────────────────────────────────────────────────
  log('🏷 ', 'Seeding tags…');

  const tagSalesId = await findOrCreate(payload, 'tags',
    { slug: { equals: 'b2b-sales' } },
    { nameAr: 'مبيعات B2B', nameEn: 'B2B Sales', slug: 'b2b-sales', type: 'skill' },
  );

  const tagNegotiationId = await findOrCreate(payload, 'tags',
    { slug: { equals: 'negotiation' } },
    { nameAr: 'مفاوضات', nameEn: 'Negotiation', slug: 'negotiation', type: 'skill' },
  );

  const tagDigitalMarketingId = await findOrCreate(payload, 'tags',
    { slug: { equals: 'digital-marketing' } },
    { nameAr: 'تسويق رقمي', nameEn: 'Digital Marketing', slug: 'digital-marketing', type: 'skill' },
  );

  const tagStartupsId = await findOrCreate(payload, 'tags',
    { slug: { equals: 'startups' } },
    { nameAr: 'شركات ناشئة', nameEn: 'Startups', slug: 'startups', type: 'industry' },
  );

  const tagLeadershipId = await findOrCreate(payload, 'tags',
    { slug: { equals: 'leadership-skills' } },
    { nameAr: 'مهارات القيادة', nameEn: 'Leadership Skills', slug: 'leadership-skills', type: 'skill' },
  );

  // ── 3. Media — Instructor Photos ──────────────────────────────────────────
  log('🖼 ', 'Uploading instructor photos…');

  const photo1Id = await uploadPhoto(payload, 'instructor-salah.png', 'صلاح خليل — خبير مبيعات');
  const photo2Id = await uploadPhoto(payload, 'instructor-karim.png', 'كريم تركي — خبير تسويق');
  const photo3Id = await uploadPhoto(payload, 'instructor-dina.png', 'دينا حسن — مستشارة قيادة');

  // ── 4. Instructors ─────────────────────────────────────────────────────────
  log('👨‍🏫', 'Seeding instructors…');

  const instructor1Id = await findOrCreate(payload, 'instructors',
    { slug: { equals: 'salah-khalil' } },
    {
      firstName: 'صلاح',
      lastName: 'خليل',
      slug: 'salah-khalil',
      jobTitle: 'خبير مبيعات B2B',
      tagline: 'خبير مبيعات B2B بخبرة +15 سنة في السوق المصري والخليجي',
      bioAr: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'صلاح خليل خبير مبيعات B2B بخبرة تتجاوز 15 عاماً في السوق المصري والخليجي. عمل مع شركات Fortune 500 وساعد أكثر من 300 محترف مبيعات على تحقيق أهدافهم. متخصص في بناء فرق المبيعات، تطوير استراتيجيات Pipeline، وإتقان فن التفاوض وإغلاق الصفقات الكبرى.',
                version: 1,
              }],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'حاصل على شهاداتSalesforce Certified Sales Professional وCertified Sales Executive من SMEI. مؤسس مدرسة Next Academy للمبيعات ومدرب معتمد من Dale Carnegie Institute.',
                version: 1,
              }],
              version: 1,
            },
          ],
          direction: 'rtl',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      bioEn: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'Salah Khalil is a B2B sales expert with 15+ years of experience in the Egyptian and Gulf markets. He has worked with Fortune 500 companies and helped over 300 sales professionals achieve their targets. He specializes in building sales teams, developing pipeline strategies, and mastering negotiation and deal-closing.',
                version: 1,
              }],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      email: 'salah@nextacademyedu.com',
      linkedinUrl: 'https://linkedin.com/in/salah-khalil',
      twitterUrl: 'https://twitter.com/salah_khalil',
      ...(photo1Id ? { picture: photo1Id } : {}),
      featuredOrder: 1,
      isActive: true,
    },
    'firstName',
  );

  const instructor2Id = await findOrCreate(payload, 'instructors',
    { slug: { equals: 'karim-torki' } },
    {
      firstName: 'كريم',
      lastName: 'تركي',
      slug: 'karim-torki',
      jobTitle: 'مدير تسويق تنفيذي | CMO',
      tagline: 'خبير تسويق رقمي بخبرة +10 سنوات في بناء العلامات التجارية',
      bioAr: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'كريم تركي CMO سابق في شركات تقنية مصرية ناشئة حققت نمواً 10x في 3 سنوات. خبرته تشمل SEO، إعلانات Google وMeta، استراتيجية المحتوى، وتحليل البيانات. ساعد 50+ براند في بناء حضور رقمي قوي وتحقيق عائد استثمار ملموس.',
                version: 1,
              }],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'حاصل على شهادة Google Digital Marketing & E-commerce Professional وMeta Certified Digital Marketing Associate. مدرب معتمد من HubSpot Academy.',
                version: 1,
              }],
              version: 1,
            },
          ],
          direction: 'rtl',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      bioEn: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'Karim Torki is a former CMO at Egyptian tech startups that achieved 10x growth in 3 years. His expertise covers SEO, Google & Meta advertising, content strategy, and data analytics. He has helped 50+ brands build strong digital presence and achieve measurable ROI.',
                version: 1,
              }],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      email: 'karim@nextacademyedu.com',
      linkedinUrl: 'https://linkedin.com/in/karim-torki',
      twitterUrl: 'https://twitter.com/karim_torki',
      ...(photo2Id ? { picture: photo2Id } : {}),
      featuredOrder: 2,
      isActive: true,
    },
    'firstName',
  );

  const instructor3Id = await findOrCreate(payload, 'instructors',
    { slug: { equals: 'dina-hassan' } },
    {
      firstName: 'دينا',
      lastName: 'حسن',
      slug: 'dina-hassan',
      jobTitle: 'مستشارة قيادة وتطوير تنظيمي',
      tagline: 'متخصصة في بناء فرق العمل عالية الأداء وتطوير القادة',
      bioAr: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'دينا حسن مستشارة قيادة وتطوير تنظيمي بخبرة +12 عاماً في تدريب المديرين والقادة في القطاعين العام والخاص. ساعدت أكثر من 200 قائد على تطوير مهاراتهم القيادية وبناء فرق عمل متماسكة عالية الأداء. متخصصة في نماذج DISC، Situational Leadership، وOKRs.',
                version: 1,
              }],
              version: 1,
            },
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'حاصلة على ICF Professional Certified Coach (PCC) وشهادة في التطوير التنظيمي من AUC. عضو في Egyptian Coach Association وArab Coaches Union.',
                version: 1,
              }],
              version: 1,
            },
          ],
          direction: 'rtl',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      bioEn: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [{
                type: 'text',
                text: 'Dina Hassan is a leadership and organizational development consultant with 12+ years of experience training managers and leaders across public and private sectors. She has helped 200+ leaders develop their leadership skills and build high-performance teams. Specializes in DISC, Situational Leadership, and OKRs.',
                version: 1,
              }],
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
      email: 'dina@nextacademyedu.com',
      linkedinUrl: 'https://linkedin.com/in/dina-hassan-coach',
      twitterUrl: 'https://twitter.com/dina_hassan_coach',
      ...(photo3Id ? { picture: photo3Id } : {}),
      featuredOrder: 3,
      isActive: true,
    },
    'firstName',
  );

  // ── 5. Instructor user accounts ────────────────────────────────────────────
  log('👤', 'Seeding instructor user accounts…');

  const user1Id = await findOrCreate(payload, 'users',
    { email: { equals: 'salah@nextacademyedu.com' } },
    {
      email: 'salah@nextacademyedu.com',
      password: 'Instructor@123',
      firstName: 'صلاح',
      lastName: 'خليل',
      role: 'instructor',
      instructorId: Number(instructor1Id),
      emailVerified: true,
    },
    'email',
  );

  const user2Id = await findOrCreate(payload, 'users',
    { email: { equals: 'karim@nextacademyedu.com' } },
    {
      email: 'karim@nextacademyedu.com',
      password: 'Instructor@123',
      firstName: 'كريم',
      lastName: 'تركي',
      role: 'instructor',
      instructorId: Number(instructor2Id),
      emailVerified: true,
    },
    'email',
  );

  const user3Id = await findOrCreate(payload, 'users',
    { email: { equals: 'dina@nextacademyedu.com' } },
    {
      email: 'dina@nextacademyedu.com',
      password: 'Instructor@123',
      firstName: 'دينا',
      lastName: 'حسن',
      role: 'instructor',
      instructorId: Number(instructor3Id),
      emailVerified: true,
    },
    'email',
  );

  // ── 6. Programs ────────────────────────────────────────────────────────────
  log('📚', 'Seeding programs…');

  // Workshop 1: Sales Mastery
  const program1Id = await findOrCreate(payload, 'programs',
    { slug: { equals: 'mastering-sales' } },
    {
      type: 'workshop',
      titleAr: 'إتقان فن المبيعات',
      titleEn: 'Mastering Sales',
      slug: 'mastering-sales',
      shortDescriptionAr: 'ورشة عملية لإتقان مهارات البيع والتفاوض',
      shortDescriptionEn: 'A practical workshop to master selling and negotiation skills',
      category: catSalesId,
      instructor: instructor1Id,
      durationHours: 12,
      sessionsCount: 4,
      level: 'intermediate',
      language: 'ar',
      objectives: [
        { item: 'بناء pipeline مبيعات فعّال' },
        { item: 'إتقان مهارات التفاوض وإغلاق الصفقات' },
        { item: 'فهم سيكولوجية المشتري' },
      ],
      requirements: [{ item: 'خبرة مبيعات لا تقل عن سنة' }],
      targetAudience: [
        { item: 'مندوبي المبيعات' },
        { item: 'مديري المبيعات' },
        { item: 'رواد الأعمال' },
      ],
      tags: [tagSalesId, tagNegotiationId],
      isFeatured: true,
      isActive: true,
      seoTitle: 'ورشة إتقان فن المبيعات — Next Academy',
      seoDescription: 'ورشة عملية لإتقان مهارات البيع والتفاوض مع خبير مبيعات B2B',
    },
    'titleAr',
  );

  // Workshop 2: Digital Marketing
  const program2Id = await findOrCreate(payload, 'programs',
    { slug: { equals: 'digital-marketing-101' } },
    {
      type: 'workshop',
      titleAr: 'التسويق الرقمي من الصفر',
      titleEn: 'Digital Marketing 101',
      slug: 'digital-marketing-101',
      shortDescriptionAr: 'تعلم التسويق الرقمي بأسلوب عملي وتطبيقي',
      shortDescriptionEn: 'Learn digital marketing in a practical and hands-on style',
      category: catMarketingId,
      instructor: instructor2Id,
      durationHours: 8,
      sessionsCount: 3,
      level: 'beginner',
      language: 'ar',
      objectives: [
        { item: 'فهم أساسيات التسويق الرقمي' },
        { item: 'إنشاء خطة تسويق رقمي متكاملة' },
        { item: 'قياس وتحليل نتائج الحملات' },
      ],
      requirements: [{ item: 'لا يشترط خبرة مسبقة' }],
      targetAudience: [
        { item: 'أصحاب الأعمال الصغيرة' },
        { item: 'المبتدئين في مجال التسويق' },
      ],
      tags: [tagDigitalMarketingId, tagStartupsId],
      isFeatured: true,
      isActive: true,
    },
    'titleAr',
  );

  // Course: Leadership Program
  const program3Id = await findOrCreate(payload, 'programs',
    { slug: { equals: 'leadership-program' } },
    {
      type: 'course',
      titleAr: 'برنامج القادة المتميزين',
      titleEn: 'Excellence Leadership Program',
      slug: 'leadership-program',
      shortDescriptionAr: 'برنامج شامل لبناء مهارات القيادة الفعّالة',
      shortDescriptionEn: 'A comprehensive program to build effective leadership skills',
      category: catLeadershipId,
      instructor: instructor3Id,
      durationHours: 24,
      sessionsCount: 8,
      level: 'advanced',
      language: 'ar',
      objectives: [
        { item: 'تطوير أسلوب القيادة الشخصي' },
        { item: 'بناء وإدارة فرق عالية الأداء' },
        { item: 'اتخاذ القرارات الاستراتيجية' },
      ],
      requirements: [
        { item: 'خبرة إدارية لا تقل عن 3 سنوات' },
        { item: 'مسؤولية الإشراف على فريق' },
      ],
      targetAudience: [
        { item: 'المديرون وأصحاب الشركات' },
        { item: 'القادة الطموحون' },
      ],
      tags: [tagLeadershipId],
      isFeatured: true,
      isActive: true,
    },
    'titleAr',
  );

  // Webinar: Finance Basics
  const program4Id = await findOrCreate(payload, 'programs',
    { slug: { equals: 'finance-basics-webinar' } },
    {
      type: 'webinar',
      titleAr: 'أساسيات المالية للمشاريع الناشئة',
      titleEn: 'Finance Basics for Startups',
      slug: 'finance-basics-webinar',
      shortDescriptionAr: 'ويبينار مجاني لفهم أساسيات المالية لرواد الأعمال',
      shortDescriptionEn: 'Free webinar to understand finance basics for entrepreneurs',
      category: catFinanceId,
      instructor: instructor1Id,
      durationHours: 2,
      sessionsCount: 1,
      level: 'beginner',
      language: 'ar',
      objectives: [
        { item: 'فهم القوائم المالية الأساسية' },
        { item: 'إدارة التدفق النقدي' },
      ],
      requirements: [{ item: 'لا يشترط خبرة مسبقة' }],
      targetAudience: [
        { item: 'رواد الأعمال' },
        { item: 'أصحاب المشاريع الصغيرة' },
      ],
      tags: [tagStartupsId],
      isFeatured: false,
      isActive: true,
    },
    'titleAr',
  );

  // ── 6. Rounds ──────────────────────────────────────────────────────────────
  log('🔄', 'Seeding rounds…');

  const round1Id = await findOrCreate(payload, 'rounds',
    { and: [{ program: { equals: program1Id } }, { roundNumber: { equals: 5 } }] },
    {
      program: program1Id,
      roundNumber: 5,
      title: 'الراوند الخامس - أبريل 2026',
      startDate: '2026-04-05T09:00:00.000Z',
      endDate: '2026-04-05T21:00:00.000Z',
      timezone: 'Africa/Cairo',
      locationType: 'online',
      meetingUrl: 'https://zoom.us/j/123456789',
      maxCapacity: 30,
      price: 3500,
      earlyBirdPrice: 2800,
      earlyBirdDeadline: '2026-03-25T23:59:59.000Z',
      currency: 'EGP',
      status: 'open',
      isActive: true,
      autoCloseOnFull: true,
    },
    'title',
  );

  const round2Id = await findOrCreate(payload, 'rounds',
    { and: [{ program: { equals: program2Id } }, { roundNumber: { equals: 3 } }] },
    {
      program: program2Id,
      roundNumber: 3,
      title: 'الراوند الثالث - أبريل 2026',
      startDate: '2026-04-12T10:00:00.000Z',
      endDate: '2026-04-14T17:00:00.000Z',
      timezone: 'Africa/Cairo',
      locationType: 'in-person',
      locationName: 'مركز Next Academy',
      locationAddress: 'القاهرة، مصر',
      maxCapacity: 20,
      price: 2500,
      currency: 'EGP',
      status: 'open',
      isActive: true,
      autoCloseOnFull: true,
    },
    'title',
  );

  const round3Id = await findOrCreate(payload, 'rounds',
    { and: [{ program: { equals: program3Id } }, { roundNumber: { equals: 2 } }] },
    {
      program: program3Id,
      roundNumber: 2,
      title: 'الدفعة الثانية - مايو 2026',
      startDate: '2026-05-03T09:00:00.000Z',
      endDate: '2026-06-14T17:00:00.000Z',
      timezone: 'Africa/Cairo',
      locationType: 'hybrid',
      locationName: 'مركز Next Academy / أونلاين',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      maxCapacity: 15,
      price: 8500,
      earlyBirdPrice: 7000,
      earlyBirdDeadline: '2026-04-15T23:59:59.000Z',
      currency: 'EGP',
      status: 'upcoming',
      isActive: true,
      autoCloseOnFull: true,
    },
    'title',
  );

  const round4Id = await findOrCreate(payload, 'rounds',
    { and: [{ program: { equals: program4Id } }, { roundNumber: { equals: 1 } }] },
    {
      program: program4Id,
      roundNumber: 1,
      title: 'ويبينار مارس 2026',
      startDate: '2026-03-25T19:00:00.000Z',
      endDate: '2026-03-25T21:00:00.000Z',
      timezone: 'Africa/Cairo',
      locationType: 'online',
      meetingUrl: 'https://zoom.us/j/987654321',
      maxCapacity: 200,
      price: 0,
      currency: 'EGP',
      status: 'open',
      isActive: true,
      autoCloseOnFull: false,
    },
    'title',
  );

  // ── 7. Sessions ────────────────────────────────────────────────────────────
  log('📅', 'Seeding sessions…');

  // Sessions for Round 1 (Mastering Sales — 4 sessions on one day)
  for (let i = 1; i <= 4; i++) {
    const startHour = 8 + (i - 1) * 3;
    const endHour = startHour + 3;
    await findOrCreate(
      payload,
      'sessions',
      {
        and: [
          { round: { equals: round1Id } },
          { sessionNumber: { equals: i } },
        ],
      },
      {
        round: round1Id,
        sessionNumber: i,
        title: `الجلسة ${i}: ${['أساسيات البيع', 'بناء الـ Pipeline', 'التفاوض وإغلاق الصفقات', 'إدارة العلاقات'][i - 1]}`,
        description: `محتوى الجلسة ${i} من ورشة إتقان فن المبيعات`,
        date: '2026-04-05T00:00:00.000Z',
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(endHour).padStart(2, '0')}:00`,
        locationType: 'online',
        meetingUrl: 'https://zoom.us/j/123456789',
        instructor: instructor1Id,
      },
      'title',
    );
  }

  // Sessions for Round 2 (Digital Marketing — 3 sessions over 3 days)
  const dm_sessions = [
    { title: 'أساسيات التسويق الرقمي وقنواته', date: '2026-04-12T00:00:00.000Z' },
    { title: 'إنشاء المحتوى وإدارة السوشيال ميديا', date: '2026-04-13T00:00:00.000Z' },
    { title: 'الإعلانات المدفوعة وتحليل الأداء', date: '2026-04-14T00:00:00.000Z' },
  ];
  for (let i = 0; i < dm_sessions.length; i++) {
    await findOrCreate(
      payload,
      'sessions',
      { and: [{ round: { equals: round2Id } }, { sessionNumber: { equals: i + 1 } }] },
      {
        round: round2Id,
        sessionNumber: i + 1,
        title: dm_sessions[i].title,
        description: `الجلسة ${i + 1} من ورشة التسويق الرقمي من الصفر`,
        date: dm_sessions[i].date,
        startTime: '10:00',
        endTime: '17:00',
        locationType: 'in-person',
        locationName: 'مركز Next Academy، القاهرة',
        instructor: instructor2Id,
      },
      'title',
    );
  }

  // Sessions for Round 3 (Leadership — 3 sample sessions weekly)
  const leadership_sessions = [
    { title: 'اكتشاف أسلوب قيادتك', date: '2026-05-03T00:00:00.000Z' },
    { title: 'بناء الفريق عالي الأداء', date: '2026-05-10T00:00:00.000Z' },
    { title: 'اتخاذ القرارات في بيئة ضغط', date: '2026-05-17T00:00:00.000Z' },
  ];
  for (let i = 0; i < leadership_sessions.length; i++) {
    await findOrCreate(
      payload,
      'sessions',
      { and: [{ round: { equals: round3Id } }, { sessionNumber: { equals: i + 1 } }] },
      {
        round: round3Id,
        sessionNumber: i + 1,
        title: leadership_sessions[i].title,
        description: `الجلسة ${i + 1} من برنامج القادة المتميزين`,
        date: leadership_sessions[i].date,
        startTime: '09:00',
        endTime: '17:00',
        locationType: 'hybrid',
        locationName: 'مركز Next Academy / أونلاين',
        meetingUrl: 'https://meet.google.com/abc-defg-hij',
        instructor: instructor3Id,
      },
      'title',
    );
  }

  // Session for Round 4 (Webinar — 1 session)
  await findOrCreate(
    payload,
    'sessions',
    { and: [{ round: { equals: round4Id } }, { sessionNumber: { equals: 1 } }] },
    {
      round: round4Id,
      sessionNumber: 1,
      title: 'أساسيات المالية للمشاريع الناشئة',
      description: 'جلسة مكثفة لفهم القوائم المالية وإدارة التدفق النقدي',
      date: '2026-03-25T00:00:00.000Z',
      startTime: '19:00',
      endTime: '21:00',
      locationType: 'online',
      meetingUrl: 'https://zoom.us/j/987654321',
      instructor: instructor1Id,
    },
    'title',
  );

  console.log('\n🎉 Dev seed complete!\n');
  console.log('  Categories : 4');
  console.log('  Tags       : 5');
  console.log('  Instructors: 3');
  console.log('  Users      : 2 (instructor accounts)');
  console.log('  Programs   : 4 (2 workshops, 1 course, 1 webinar)');
  console.log('  Rounds     : 4');
  console.log('  Sessions   : 11');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
