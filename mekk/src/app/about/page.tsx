import Navbar from '@/components/Navbar';
import AboutHeroSection from '@/components/about/AboutHeroSection';
import AboutManifestoSection from '@/components/about/AboutManifestoSection';
import AboutStorySection from '@/components/about/AboutStorySection';
import AboutPhilosophySection from '@/components/about/AboutPhilosophySection';
import AboutTimelineSection from '@/components/about/AboutTimelineSection';
import AboutCorneredSection from '@/components/about/AboutCorneredSection';
import AboutKeywordsSection from '@/components/about/AboutKeywordsSection';
import AboutOnePercentSection from '@/components/about/AboutOnePercentSection';
import AboutContactSection from '@/components/about/AboutContactSection';
import ImpactTransitionSection from '@/components/ui/ImpactTransitionSection';
import FooterSection from '@/components/FooterSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Muhammed Mekky | Marketing Automation Strategist',
    description: 'Learn about Muhammed Mekky\'s journey, philosophy, and the systems he builds to help businesses scale intelligently using AI and automation.',
};

export default function AboutPage() {
    return (
        <main>
            <Navbar />
            <div className="page-wrapper">
                <AboutHeroSection />
                <ImpactTransitionSection
                    blurredPart="DISTRA"
                    sharpPart="ACTION"
                    questions={[
                        "ARE YOU DROWNING IN MANUAL TASKS?",
                        "DO YOU RUN YOUR SYSTEMS, OR DO THEY RUN YOU?",
                        "TIRED OF PUTTING OUT FIRES INSTEAD OF SCALING?",
                        "READY TO TAKE THE HELM OF YOUR BUSINESS?"
                    ]}
                    topLabel="THE 1% TEST"
                    bottomNote="Action is the only antidote to distraction."
                    id="distraction-section"
                />
                <AboutManifestoSection />
                <AboutStorySection />
                <AboutPhilosophySection />
                <AboutTimelineSection />
                <AboutCorneredSection />
                <AboutKeywordsSection />
                <AboutOnePercentSection />
                <AboutContactSection />
            </div>
            <FooterSection />
        </main>
    );
}
