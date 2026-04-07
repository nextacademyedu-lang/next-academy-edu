import { createClient } from '@/utils/supabase/server';
import AdminTable from '@/components/admin/AdminTable';
import { deleteProject } from '../actions';

export const revalidate = 0; // Ensure fresh data on every load

export default async function AdminProjectsPage() {
    const supabase = await createClient();

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching projects:", error);
    }

    return (
        <AdminTable
            title="Projects"
            description="Manage your portfolio projects. Changes will reflect instantly on the Live site."
            items={projects || []}
            baseRoute="/admin/projects"
            onDelete={deleteProject}
        />
    );
}
