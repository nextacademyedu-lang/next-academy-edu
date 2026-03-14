import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero';
import { StatsSection } from '@/components/sections/stats';
import { B2BTrustedSection } from '@/components/sections/b2b-trusted';
import { FeaturedPrograms } from '@/components/sections/featured';
import { WhyChooseUs } from '@/components/sections/why-choose-us';
import { TextTestimonialsSection } from '@/components/sections/text-testimonials';
import { InstructorsPreview } from '@/components/sections/instructors-preview';
import { VideoTestimonialsSection } from '@/components/sections/video-testimonials';
import { BlogsPreviewSection } from '@/components/sections/blogs-preview';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <HeroSection />
        <StatsSection />
        <FeaturedPrograms />
        <WhyChooseUs />
        <TextTestimonialsSection />
        <InstructorsPreview />
        <B2BTrustedSection />
        <VideoTestimonialsSection />
        <BlogsPreviewSection />
      </main>

      <Footer />
    </div>
  );
}
