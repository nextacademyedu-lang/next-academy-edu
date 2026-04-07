import Preloader from '@/components/Preloader';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import StatsSection from '@/components/StatsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import MotivationSection from '@/components/MotivationSection';
import BlueprintSection from '@/components/BlueprintSection';
import CaseStudyTeaser from '@/components/CaseStudyTeaser';
import FooterSection from '@/components/FooterSection';
import StickyCTA from '@/components/StickyCTA';
import ImpactTransitionSection from '@/components/ui/ImpactTransitionSection';
import { createClient } from '@/utils/supabase/server';

export default async function Home() {
  const supabase = await createClient();

  const { data: caseStudies } = await supabase
    .from('case_studies')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1);

  return (
    <>
      <Preloader />
      <Navbar />
      <div className="page-wrapper">
        <HeroSection />
        <AboutSection />
        <MotivationSection />
        <ServicesSection />
        <BlueprintSection />
        <StatsSection />
        <CaseStudyTeaser />

        <ImpactTransitionSection
          id="overwhelmed"
          blurredPart="OVERW"
          sharpPart="HELM"
          questions={[
            "ARE YOUR MARKETING TOOLS TALKING TO EACH OTHER?",
            "DO YOU FEEL THERE'S A CEILING TO YOUR GROWTH?",
            "ARE YOU RELYING ON SHEER HUMAN EFFORT?",
            "WHAT HAPPENS IF YOU STEP AWAY FOR A WEEK?",
            "ARE YOU READY TO TAKE TRUE CONTROL?"
          ]}
        />

        <TestimonialsSection />
        <FooterSection />
      </div>
      <StickyCTA />
    </>
  );
}
