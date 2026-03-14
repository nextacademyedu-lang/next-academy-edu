import { AnimatedAuthLayout } from '@/components/auth/AnimatedAuthLayout';

export default function AuthLayoutGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AnimatedAuthLayout>
      {children}
    </AnimatedAuthLayout>
  );
}
