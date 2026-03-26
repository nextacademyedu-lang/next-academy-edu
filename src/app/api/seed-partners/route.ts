import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

// ─── Partners from old site ────────────────────────────────────────────────
const partners = [
  {
    name: 'Bedaya',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945505696-1awc98w14f4.png',
    website: '',
    orderIndex: 2,
  },
  {
    name: 'EBC',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945608097-j08bjln35nq.png',
    website: '',
    orderIndex: 0,
  },
  {
    name: 'Ex Agency',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945556068-1vn0l3a7knc.png',
    website: '',
    orderIndex: 1,
  },
  {
    name: 'Green Studio',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945539049-zilhh9vcub.png',
    website: '',
    orderIndex: 4,
  },
  {
    name: 'Bendary',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945528091-dsegfp6tccn.png',
    website: '',
    orderIndex: 3,
  },
  {
    name: 'Eventocity',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945632639-81ndj22rxvo.png',
    website: 'https://eventocity.com',
    orderIndex: 1,
  },
  {
    name: 'We Event',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945583737-prsdmo0pn7.png',
    website: '',
    orderIndex: 0,
  },
  {
    name: 'BLS',
    logoUrl: 'https://afokabguqrexeqkfretn.supabase.co/storage/v1/object/public/cms_images/1768945599063-uzrc7tmqd1.png',
    website: '',
    orderIndex: 0,
  },
];

// Helper: upload image from external URL to Payload media
async function uploadImageFromUrl(
  payload: Awaited<ReturnType<typeof getPayload>>,
  url: string,
  filename: string,
): Promise<number | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') || 'image/png';
    const ext = mimeType.split('/')[1]?.split(';')[0] || 'png';

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
    console.error(`[seed-partners] Failed to upload ${url}:`, err);
    return null;
  }
}

export async function POST() {
  try {
    const payload = await getPayload({ config });
    const results: string[] = [];

    for (const p of partners) {
      // Skip if partner with same name already exists
      const existing = await payload.find({
        collection: 'partners',
        where: { name: { equals: p.name } },
        limit: 1,
        overrideAccess: true,
      });
      if (existing.docs.length > 0) {
        results.push(`⏭️ skipped (exists): ${p.name}`);
        continue;
      }

      // Upload logo
      const logoId = await uploadImageFromUrl(payload, p.logoUrl, `partner-${p.name.toLowerCase().replace(/\s+/g, '-')}`);
      if (!logoId) {
        results.push(`❌ failed to upload logo for: ${p.name}`);
        continue;
      }

      await payload.create({
        collection: 'partners',
        data: {
          name: p.name,
          logo: logoId,
          website: p.website || undefined,
          orderIndex: p.orderIndex,
          isActive: true,
          category: 'general',
        },
        overrideAccess: true,
      });
      results.push(`✅ created: ${p.name}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[seed-partners]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
