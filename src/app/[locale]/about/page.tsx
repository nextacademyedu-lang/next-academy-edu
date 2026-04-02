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

export const metadata: Metadata = {
  title: 'About Us | Next Academy',
  description: 'Next Academy is a digital training platform helping entrepreneurs and small business owners grow with practical tools and modern strategies.',
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
        <AboutEvents />
        <AboutTeam />
        <AboutCta />
      </main>

      <Footer />
    </div>
  );
}
