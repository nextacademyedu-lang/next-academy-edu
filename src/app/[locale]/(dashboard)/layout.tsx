import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/dashboard',
    titleAr: 'لوحة الطالب',
    titleEn: 'Student Dashboard',
    descriptionAr: 'لوحة تحكم الطالب لمتابعة الدورات والحجوزات والمدفوعات.',
    descriptionEn: 'Student dashboard for courses, bookings, and payments.',
    noIndex: true,
  });
}

export default function DashboardGroupBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
