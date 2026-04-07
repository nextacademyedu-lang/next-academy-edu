import AdminForm, { FieldConfig } from '@/components/admin/AdminForm';
import { saveBlog } from '../../actions';

const blogFields: FieldConfig[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'slug', label: 'Slug (URL friendly)', type: 'text', required: true },
    { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
    { name: 'image', label: 'Cover Image URL', type: 'text', required: true },
    { name: 'content', label: 'Blog Content Regions', type: 'textarea', helperText: 'Currently basic text input. Enter each paragraph/string item separated by a newline.', required: true },
    { name: 'publish_date', label: 'Publish Date', type: 'date' },
    { name: 'published', label: 'Published Status', type: 'checkbox' },
];

export default function NewBlogPage() {
    return (
        <AdminForm
            title="Create New Blog Post"
            action={saveBlog}
            fields={blogFields}
            backLink="/admin/blogs"
        />
    );
}
