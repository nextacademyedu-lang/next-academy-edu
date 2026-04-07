'use server';

import { createClient } from '@/utils/supabase/server';
import { PROJECTS, CASE_STUDIES, BLOGS } from '@/lib/constants';

export async function seedDatabase() {
    const supabase = await createClient();

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized. You must be an admin to seed the database.' };
    }

    try {
        // Seed Projects
        for (const p of PROJECTS.items) {
            const { error } = await supabase.from('projects').upsert({
                title: p.title,
                slug: p.slug,
                category: p.category,
                description: p.description,
                long_description: p.longDescription,
                image: p.image,
                color: p.color,
                tools: p.tools,
                results: p.results,
                published: true
            }, { onConflict: 'slug' });
            if (error) throw new Error(`Project Seed Error: ${error.message}`);
        }

        // Seed Case Studies
        for (const c of CASE_STUDIES.items) {
            const { error } = await supabase.from('case_studies').upsert({
                title: c.title,
                slug: c.slug,
                category: c.category,
                description: c.description,
                image: c.image,
                challenge: c.challenge,
                solution: c.solution,
                results: c.results,
                published: true
            }, { onConflict: 'slug' });
            if (error) throw new Error(`Case Study Seed Error: ${error.message}`);
        }

        // Seed Blogs
        for (const b of BLOGS.items) {
            const { error } = await supabase.from('blogs').upsert({
                title: b.title,
                slug: b.slug,
                excerpt: b.excerpt,
                image: b.image,
                content: b.content,
                published: true,
                publish_date: new Date(b.date).toISOString()
            }, { onConflict: 'slug' });
            if (error) throw new Error(`Blog Seed Error: ${error.message}`);
        }

        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
