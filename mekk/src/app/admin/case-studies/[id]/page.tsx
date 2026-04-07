import { createClient } from '@/utils/supabase/server';
import AdminForm, { FieldConfig } from '@/components/admin/AdminForm';
import { saveCaseStudy } from '../../actions';
import { notFound } from 'next/navigation';

const caseStudyFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug (URL friendly)', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'text', required: true },
    { name: 'description', label: 'Short Description', type: 'textarea', required: true },
    { name: 'image', label: 'Image URL', type: 'text', required: true },
    { name: 'challenge', label: 'The Challenge', type: 'textarea', required: true },
    { name: 'solution', label: 'The Solution', type: 'textarea', required: true },
    { name: 'results', label: 'Results / Highlights', type: 'textarea', helperText: 'Enter one result per line.' },
    { name: 'published', label: 'Published Status', type: 'checkbox' },
];

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: caseStudy } = await supabase.from('case_studies').select('*').eq('id', resolvedParams.id).single();

    if (!caseStudy) notFound();

    return (
        <AdminForm
            title="Edit Case Study"
            action={saveCaseStudy}
            fields={caseStudyFields}
            initialData={caseStudy}
            backLink="/admin/case-studies"
        />
    );
}
