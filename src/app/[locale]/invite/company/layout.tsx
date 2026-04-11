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
    path: '/invite/company',
    titleAr: 'دعوة الشركة',
    titleEn: 'Company Invitation',
    descriptionAr: 'صفحة قبول دعوات الشركات والانضمام إلى لوحة B2B.',
    descriptionEn: 'Company invitation acceptance page for B2B onboarding.',
    noIndex: true,
  });
}

export default function CompanyInviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
