import { createClient } from '@/utils/supabase/server';
import AdminTable from '@/components/admin/AdminTable';
import { deleteBlog } from '../actions';

export const revalidate = 0; // Ensure fresh data on every load

export default async function AdminBlogsPage() {
    const supabase = await createClient();

    const { data: blogs, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching blogs:", error);
    }

    return (
        <AdminTable
            title="Blogs"
            description="Manage your blog articles and insights."
            items={blogs || []}
            baseRoute="/admin/blogs"
            onDelete={deleteBlog}
        />
    );
}
