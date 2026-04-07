import AdminForm, { FieldConfig } from '@/components/admin/AdminForm';
import { saveProject } from '../../actions';

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

export default function NewProjectPage() {
    return (
        <AdminForm
            title="Create New Project"
            action={saveProject}
            fields={projectFields}
            backLink="/admin/projects"
        />
    );
}
