'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ScrollHighlightProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export default function ScrollHighlight({ children, className = '', delay = 0 }: ScrollHighlightProps) {
    const textRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!textRef.current) return;

        const el = textRef.current;

        const ctx = gsap.context(() => {
            gsap.to(el, {
                backgroundSize: '100% 100%',
                ease: 'power2.inOut',
                duration: 1,
                delay: delay,
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                }
            });
        });

        return () => ctx.revert();
    }, [delay]);

    const highlightStyle: React.CSSProperties = {
        background: 'linear-gradient(120deg, var(--accent) 0%, var(--accent) 100%)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '0% 100%',
        color: 'white', // Text color when highlighted
        padding: '0.1em 0.3em',
        borderRadius: '4px',
        display: 'inline-block',
    };

    return (
        <span ref={textRef} className={className} style={highlightStyle}>
            {children}
        </span>
    );
}
