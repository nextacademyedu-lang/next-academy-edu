import type { Metadata } from 'next';
import { AnimatedAuthLayout } from '@/components/auth/AnimatedAuthLayout';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/login',
    titleAr: 'تسجيل الدخول',
    titleEn: 'Authentication',
    descriptionAr: 'صفحات تسجيل الدخول وإنشاء الحساب واستعادة كلمة المرور.',
    descriptionEn: 'Login, registration, and account recovery pages.',
    noIndex: true,
  });
}

export default function AuthLayoutGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatedAuthLayout>
      {children}
    </AnimatedAuthLayout>
  );
}
