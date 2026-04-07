import AdminForm, { FieldConfig } from '@/components/admin/AdminForm';
import { saveCaseStudy } from '../../actions';

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

export default function NewCaseStudyPage() {
    return (
        <AdminForm
            title="Create New Case Study"
            action={saveCaseStudy}
            fields={caseStudyFields}
            backLink="/admin/case-studies"
        />
    );
}
