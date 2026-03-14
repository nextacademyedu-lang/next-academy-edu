import type { Metadata } from 'next';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export const metadata: Metadata = {
  title: 'Dashboard - Next Academy',
  description: 'Manage your learning progress and bookings.',
};

export default function DashboardGroupBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
