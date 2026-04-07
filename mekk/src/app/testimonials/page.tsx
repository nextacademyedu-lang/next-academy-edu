import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import TestimonialsHero from '@/components/testimonials/TestimonialsHero';
import TestimonialsMarquee from '@/components/testimonials/TestimonialsMarquee';
import TestimonialsStatement from '@/components/testimonials/TestimonialsStatement';
import TestimonialsStats from '@/components/testimonials/TestimonialsStats';
import TestimonialsLogos from '@/components/testimonials/TestimonialsLogos';

export const metadata = { title: "Testimonials | Muhammed Mekky", description: "See what clients and students say about Muhammed Mekky’s marketing automation, web development, and AI training." };


export default function TestimonialsPage() {
    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <TestimonialsHero />
                <TestimonialsMarquee />
                <TestimonialsStats />
                <TestimonialsStatement />
                <TestimonialsLogos />
                <FooterSection />
            </div>

        </>
    );
}
