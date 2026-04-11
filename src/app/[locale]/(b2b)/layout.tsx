import { Metadata } from 'next';
import B2BLayout from '@/components/b2b/B2BLayout';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/b2b-dashboard',
    titleAr: 'لوحة الشركات',
    titleEn: 'B2B Dashboard',
    descriptionAr: 'لوحة تحكم الشركات لإدارة الفريق والحجوزات والمقاعد.',
    descriptionEn: 'B2B dashboard for managing team bookings and seats.',
    noIndex: true,
  });
}

export default function B2BGroupRootLayout({ children }: { children: React.ReactNode }) {
  return <B2BLayout>{children}</B2BLayout>;
}
