import { createClient } from '@/utils/supabase/server';
import BlogClient from './BlogClient';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();

    // Fetch the post
    const { data: post } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .eq('published', true)
        .single();

    if (!post) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '3rem' }}>Post Not Found</h1>
                </div>
                <FooterSection />
            </>
        );
    }

    // Fetch related posts (latest 3 excluding current)
    const { data: related } = await supabase
        .from('blogs')
        .select('*')
        .neq('slug', resolvedParams.slug)
        .eq('published', true)
        .order('publish_date', { ascending: false })
        .limit(3);

    return <BlogClient post={post} related={related || []} />;
}
