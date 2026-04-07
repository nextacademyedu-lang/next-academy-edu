'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

/**
 * useGSAP — creates a GSAP context scoped to a container ref.
 * Handles proper cleanup for React 18+ strict mode.
 */
export function useGSAP(
    callback: (ctx: gsap.Context) => void,
    deps: React.DependencyList = []
) {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            callback(ctx!);
        }, containerRef);

        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return containerRef;
}
