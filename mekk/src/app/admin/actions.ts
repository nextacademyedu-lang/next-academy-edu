'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Reusable auth check
async function requireAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    return supabase;
}

// Utility to parse array fields from newline separated strings
function parseArray(val: string | null): string[] {
    if (!val) return [];
    return val.split('\n').map(s => s.trim()).filter(Boolean);
}

// --- PROJECTS ---

export async function saveProject(formData: FormData) {
    const supabase = await requireAuth();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const long_description = formData.get('long_description') as string;
    const image = formData.get('image') as string;
    const color = formData.get('color') as string;
    const published = formData.get('published') === 'true';

    const tools = parseArray(formData.get('tools') as string);
    const results = parseArray(formData.get('results') as string);

    const payload = { title, slug, category, description, long_description, image, color, tools, results, published };

    let error;
    if (id) {
        ({ error } = await supabase.from('projects').update(payload).eq('id', id));
    } else {
        ({ error } = await supabase.from('projects').insert([payload]));
    }

    if (error) return { error: error.message };

    revalidatePath('/admin/projects');
    revalidatePath('/portfolio');
    revalidatePath(`/portfolio/${slug}`);
    return { success: true };
}

export async function deleteProject(id: string) {
    const supabase = await requireAuth();
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/projects');
    revalidatePath('/portfolio');
    return { success: true };
}

// --- CASE STUDIES ---

export async function saveCaseStudy(formData: FormData) {
    const supabase = await requireAuth();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const challenge = formData.get('challenge') as string;
    const solution = formData.get('solution') as string;
    const published = formData.get('published') === 'true';

    const results = parseArray(formData.get('results') as string);

    const payload = { title, slug, category, description, image, challenge, solution, results, published };

    let error;
    if (id) {
        ({ error } = await supabase.from('case_studies').update(payload).eq('id', id));
    } else {
        ({ error } = await supabase.from('case_studies').insert([payload]));
    }

    if (error) return { error: error.message };

    revalidatePath('/admin/case-studies');
    revalidatePath('/portfolio');
    revalidatePath(`/portfolio/${slug}`); // If there's a dynamic case study page
    return { success: true };
}

export async function deleteCaseStudy(id: string) {
    const supabase = await requireAuth();
    const { error } = await supabase.from('case_studies').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/case-studies');
    revalidatePath('/portfolio');
    return { success: true };
}

// --- BLOGS ---

export async function saveBlog(formData: FormData) {
    const supabase = await requireAuth();

    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const excerpt = formData.get('excerpt') as string;
    const image = formData.get('image') as string;
    const publish_date = formData.get('publish_date') as string || new Date().toISOString();
    const published = formData.get('published') === 'true';

    // Blogs content is stored as string array currently for consistency with the legacy app, but can just be mapped from textarea
    const content = parseArray(formData.get('content') as string);

    const payload = { title, slug, excerpt, image, content, published, publish_date };

    let error;
    if (id) {
        ({ error } = await supabase.from('blogs').update(payload).eq('id', id));
    } else {
        ({ error } = await supabase.from('blogs').insert([payload]));
    }

    if (error) return { error: error.message };

    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    revalidatePath(`/blog/${slug}`);
    return { success: true };
}

export async function deleteBlog(id: string) {
    const supabase = await requireAuth();
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true };
}
