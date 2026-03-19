import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AboutHero } from '@/components/sections/about-hero';
import { AboutStory } from '@/components/sections/about-story';
import { AboutTimeline } from '@/components/sections/about-timeline';
import { AboutValues } from '@/components/sections/about-values';
import { AboutPartners } from '@/components/sections/about-partners';
import { AboutTeam } from '@/components/sections/about-team';
import { AboutCta } from '@/components/sections/about-cta';

export const metadata: Metadata = {
  title: 'About Us | Next Academy',
  description: 'Learn about Next Academy — MENA\'s premier institution for executive education, connecting ambitious professionals with elite industry practitioners.',
};

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
        <AboutTeam />
        <AboutCta />
      </main>

      <Footer />
    </div>
  );
}
