import { Metadata } from 'next';
import B2BLayout from '@/components/b2b/B2BLayout';

export const metadata: Metadata = {
  title: 'B2B Dashboard | Next Academy',
  description: 'Manage your team and company bookings.',
};

export default function B2BGroupRootLayout({ children }: { children: React.ReactNode }) {
  return <B2BLayout>{children}</B2BLayout>;
}
