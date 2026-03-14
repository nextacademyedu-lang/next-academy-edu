import { Metadata } from 'next';
import { InstructorLayout } from '@/components/instructor/InstructorLayout';

export const metadata: Metadata = {
  title: 'Instructor Portal | Next Academy',
  description: 'Manage your sessions and students.',
};

export default function InstructorGroupRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstructorLayout>{children}</InstructorLayout>;
}
