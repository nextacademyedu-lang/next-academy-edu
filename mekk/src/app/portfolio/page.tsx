import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectsShowcase from '@/components/portfolio/ProjectsShowcase';
import PortfolioCaseStudies from '@/components/portfolio/PortfolioCaseStudies';
import PortfolioStatement from '@/components/portfolio/PortfolioStatement';
import PortfolioProcess from '@/components/portfolio/PortfolioProcess';
import LecturesCTA from '@/components/lectures/LecturesCTA';
import { PROJECTS, CASE_STUDIES } from '@/lib/constants';

export const metadata = { title: "Portfolio | Muhammed Mekky", description: "Explore the marketing automation, web design, and AI-driven projects built by Muhammed Mekky." };

export default function PortfolioPage() {
    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <PortfolioHero />
                <ProjectsShowcase items={PROJECTS.items} bentoSize={5} scrollSize={4} />
                <PortfolioStatement />
                <PortfolioCaseStudies items={CASE_STUDIES.items} />
                <PortfolioProcess />
                <LecturesCTA />
                <FooterSection />
            </div>
        </>
    );
}
