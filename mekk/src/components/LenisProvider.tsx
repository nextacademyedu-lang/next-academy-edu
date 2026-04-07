'use client';

import { ReactNode } from 'react';
import { useLenis } from '@/hooks/useLenis';

export default function LenisProvider({ children }: { children: ReactNode }) {
    useLenis();
    return <>{children}</>;
}
