import { createClient } from '@/utils/supabase/server';
import AdminForm, { FieldConfig } from '@/components/admin/AdminForm';
import { saveProject } from '../../actions';
import { notFound } from 'next/navigation';

const projectFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug (URL friendly)', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'description', label: 'Short Description', type: 'textarea', required: true },
    { name: 'long_description', label: 'Long Description', type: 'textarea' },
    { name: 'image', label: 'Image URL', type: 'text', required: true },
    { name: 'color', label: 'Accent Color (Hex)', type: 'text', required: true },
    { name: 'tools', label: 'Tools Used', type: 'textarea', helperText: 'Enter one tool per line.' },
    { name: 'results', label: 'Results / Highlights', type: 'textarea', helperText: 'Enter one result per line.' },
    { name: 'published', label: 'Published Status', type: 'checkbox' },
];

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: project } = await supabase.from('projects').select('*').eq('id', resolvedParams.id).single();

    if (!project) notFound();

    return (
        <AdminForm
            title="Edit Project"
            action={saveProject}
            fields={projectFields}
            initialData={project}
            backLink="/admin/projects"
        />
    );
}
