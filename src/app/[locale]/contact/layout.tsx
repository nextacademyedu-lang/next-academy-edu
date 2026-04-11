import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/contact',
    titleAr: 'اتصل بنا',
    titleEn: 'Contact Us',
    descriptionAr: 'تواصل مع فريق Next Academy للحجوزات والاستفسارات والدعم.',
    descriptionEn: 'Contact Next Academy for bookings, support, and partnerships.',
  });
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
