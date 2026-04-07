import { createClient } from '@/utils/supabase/server';
import AdminTable from '@/components/admin/AdminTable';
import { deleteCaseStudy } from '../actions';

export const revalidate = 0; // Ensure fresh data on every load

export default async function AdminCaseStudiesPage() {
    const supabase = await createClient();

    const { data: caseStudies, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching case studies:", error);
    }

    return (
        <AdminTable
            title="Case Studies"
            description="Manage your deep-dive case studies."
            items={caseStudies || []}
            baseRoute="/admin/case-studies"
            onDelete={deleteCaseStudy}
        />
    );
}
