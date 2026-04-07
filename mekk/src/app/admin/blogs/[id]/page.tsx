import { createClient } from '@/utils/supabase/server';
import AdminForm, { FieldConfig } from '@/components/admin/AdminForm';
import { saveBlog } from '../../actions';
import { notFound } from 'next/navigation';

const blogFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug (URL friendly)', type: 'text', required: true },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
    { name: 'image', label: 'Cover Image URL', type: 'text', required: true },
    { name: 'content', label: 'Blog Content Regions', type: 'textarea', helperText: 'Currently basic text input. Enter each paragraph/string item separated by a newline.', required: true },
    { name: 'publish_date', label: 'Publish Date', type: 'date' },
    { name: 'published', label: 'Published Status', type: 'checkbox' },
];

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: blog } = await supabase.from('blogs').select('*').eq('id', resolvedParams.id).single();

    if (!blog) notFound();

    return (
        <AdminForm
            title="Edit Blog Post"
            action={saveBlog}
            fields={blogFields}
            initialData={blog}
            backLink="/admin/blogs"
        />
    );
}
