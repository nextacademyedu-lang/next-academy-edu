import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import BlogHero from '@/components/blog/BlogHero';
import BlogGrid from '@/components/blog/BlogGrid';
import BlogNewsletter from '@/components/blog/BlogNewsletter';
import { createClient } from '@/utils/supabase/server';

export const metadata = { title: "Insights & Blog | Muhammed Mekky", description: "Articles and insights on marketing automation, AI tools, web development, and digital scaling strategies." };


export default async function BlogPage() {
    const supabase = await createClient();
    const { data: blogs } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('publish_date', { ascending: false });

    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <BlogHero />
                <BlogGrid items={blogs || []} />
                <BlogNewsletter />
                <FooterSection />
            </div>

        </>
    );
}
