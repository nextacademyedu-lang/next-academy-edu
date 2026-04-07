import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import LecturesHero from '@/components/lectures/LecturesHero';
import LecturesList from '@/components/lectures/LecturesList';
import LecturesImpact from '@/components/lectures/LecturesImpact';
import LecturesCTA from '@/components/lectures/LecturesCTA';

export const metadata = { title: "Lectures & Training | Muhammed Mekky", description: "Workshops and sessions on ChatGPT, Notion, n8n, Zapier, and building automated systems for teams and individuals." };


export default function LecturesPage() {
    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <LecturesHero />
                <LecturesList />
                <LecturesImpact />
                <LecturesCTA />
                <FooterSection />
            </div>

        </>
    );
}
