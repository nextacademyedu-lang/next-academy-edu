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
    path: '/checkout',
    titleAr: 'الدفع',
    titleEn: 'Checkout',
    descriptionAr: 'صفحات إتمام الدفع وتأكيد حالة الحجز.',
    descriptionEn: 'Checkout and booking payment status pages.',
    noIndex: true,
  });
}

export default function CheckoutGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
