import { Metadata } from 'next';
import { InstructorLayout } from '@/components/instructor/InstructorLayout';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/instructor',
    titleAr: 'بوابة المدرب',
    titleEn: 'Instructor Portal',
    descriptionAr: 'لوحة المدرب لإدارة الجلسات والمواعيد والطلاب.',
    descriptionEn: 'Instructor portal for sessions, availability, and students.',
    noIndex: true,
  });
}

export default function InstructorGroupRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
