import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import CaseStudiesHero from '@/components/case-studies/CaseStudiesHero';
import CaseStudiesList from '@/components/case-studies/CaseStudiesList';
import CaseStudiesNewsletter from '@/components/case-studies/CaseStudiesNewsletter';
import { CASE_STUDIES } from '@/lib/constants';

export const metadata = { title: "Case Studies | Muhammed Mekky", description: "Deep dives into how Muhammed Mekky helped businesses scale using AI workflows and marketing automation." };

export default function CaseStudiesPage() {
    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <CaseStudiesHero />
                <CaseStudiesList items={CASE_STUDIES.items} />
                <CaseStudiesNewsletter />
                <FooterSection />
            </div>
        </>
    );
}
