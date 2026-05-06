import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { HeroSection } from '@/components/sections/hero';
import { B2BTrustedSection } from '@/components/sections/b2b-trusted';
import { FeaturedPrograms } from '@/components/sections/featured';
import { CategoriesSection } from '@/components/sections/categories-section';
import { LearningPathsSection } from '@/components/sections/learning-paths-section';
import { UpcomingEvents } from '@/components/sections/upcoming-events';
import { TextTestimonialsSection } from '@/components/sections/text-testimonials';
import { InstructorsPreview } from '@/components/sections/instructors-preview';
import { VideoTestimonialsSection } from '@/components/sections/video-testimonials';
import { BlogsPreviewSection } from '@/components/sections/blogs-preview';
import { PromoBannerSlot } from '@/components/sections/promotional-banner';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '',
    titleAr: 'الصفحة الرئيسية',
    titleEn: 'Home',
    descriptionAr: 'منصة Next Academy لتطوير الأفراد والفرق من خلال برامج تطبيقية يقودها خبراء السوق.',
    descriptionEn: 'Next Academy platform for practical upskilling programs led by market practitioners.',
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnnouncementBar locale={locale} />
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <HeroSection />
        <B2BTrustedSection />
        
        <FeaturedPrograms />
        <LearningPathsSection locale={locale} />
        <CategoriesSection locale={locale} />
        
        <PromoBannerSlot locale={locale} page="home" position="after_featured" />
        
        <UpcomingEvents locale={locale} />
        <InstructorsPreview />
        
        <div style={{ background: 'var(--bg-secondary)', paddingBottom: '2rem' }}>
          <TextTestimonialsSection />
          <VideoTestimonialsSection />
        </div>
        
        <BlogsPreviewSection />
        <PromoBannerSlot locale={locale} page="home" position="before_footer" />
      </main>

      <Footer />
    </div>
  );
}

