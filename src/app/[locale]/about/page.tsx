import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AboutHero } from '@/components/sections/about-hero';
import { AboutStory } from '@/components/sections/about-story';
import { AboutTimeline } from '@/components/sections/about-timeline';
import { AboutValues } from '@/components/sections/about-values';
import { AboutPartners } from '@/components/sections/about-partners';
import { AboutEvents } from '@/components/sections/about-events';
import { AboutTeam } from '@/components/sections/about-team';
import { AboutCta } from '@/components/sections/about-cta';
import { buildPageMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({
    locale,
    path: '/about',
    titleAr: 'من نحن',
    titleEn: 'About Us',
    descriptionAr: 'تعرف على قصة Next Academy ورسالتها وفريقها وشركائها.',
    descriptionEn: 'Learn about Next Academy story, mission, team, and partners.',
  });
}

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <AboutHero />
        <AboutStory />
        <AboutTimeline />
        <AboutValues />
        <AboutPartners />
        <AboutEvents />
        <AboutTeam />
        <AboutCta />
      </main>

      <Footer />
    </div>
  );
}
