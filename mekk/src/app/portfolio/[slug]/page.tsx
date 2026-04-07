import ProjectClient from './ProjectClient';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import { PROJECTS } from '@/lib/constants';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const project = PROJECTS.items.find((p: any) => p.slug === resolvedParams.slug);

    if (!project) {
        return {
            title: 'Project Not Found | Muhammed Mekky'
        };
    }

    return {
        title: `${project.title} | Portfolio Project by Muhammed Mekky (محمد مكي)`,
        description: `${project.description} — A professional portfolio project designed and developed by Muhammed Mekky | محمد مكي`,
        keywords: [project.title, project.category, 'Muhammed Mekky', 'محمد مكي', 'Portfolio', 'Case Study'],
        openGraph: {
            title: `${project.title} | Muhammed Mekky`,
            description: project.description,
            images: [{ url: project.image || '/images/og-preview.png', width: 1200, height: 630 }],
        }
    };
}

export async function generateStaticParams() {
    return PROJECTS.items.map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const project = PROJECTS.items.find((p: any) => p.slug === resolvedParams.slug);

    if (!project) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', fontSize: '3rem' }}>
                        Project Not Found
                    </h1>
                </div>
                <FooterSection />
            </>
        );
    }

    return <ProjectClient project={project as any} />;
}
