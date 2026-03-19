import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AnnouncementBar } from '@/components/layout/announcement-bar';
import { PopupManager } from '@/components/marketing/popup-manager';
import { HeroSection } from '@/components/sections/hero';
import { StatsSection } from '@/components/sections/stats';
import { B2BTrustedSection } from '@/components/sections/b2b-trusted';
import { FeaturedPrograms } from '@/components/sections/featured';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { UpcomingEvents } from '@/components/sections/upcoming-events';
import { TextTestimonialsSection } from '@/components/sections/text-testimonials';
import { InstructorsPreview } from '@/components/sections/instructors-preview';
import { VideoTestimonialsSection } from '@/components/sections/video-testimonials';
import { BlogsPreviewSection } from '@/components/sections/blogs-preview';

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
        <StatsSection />
        <FeaturedPrograms />
        <WhyChooseUs />
        <UpcomingEvents locale={locale} />
        <TextTestimonialsSection />
        <InstructorsPreview />
        <B2BTrustedSection />
        <VideoTestimonialsSection />
        <BlogsPreviewSection />
      </main>

      <Footer />
      <PopupManager />
    </div>
  );
}
