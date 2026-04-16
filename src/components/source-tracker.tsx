'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeSourceTracking } from '@/lib/source-tracking';

export function SourceTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initializeSourceTracking();
  }, [pathname, searchParams]);

  return null;
}
