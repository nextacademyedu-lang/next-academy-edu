'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface RevealProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
    className?: string;
    once?: boolean;
}

export default function Reveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 1,
    className = '',
    once = false
}: RevealProps) {
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!elRef.current) return;

        const ctx = gsap.context(() => {
            const vars: gsap.TweenVars = {
                opacity: 1,
                duration,
                delay,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elRef.current,
                    start: 'top 90%',
                    toggleActions: once ? 'play none none none' : 'play none none reverse',
                }
            };

            if (direction === 'up') vars.y = 0;
            if (direction === 'down') vars.y = 0;
            if (direction === 'left') vars.x = 0;
            if (direction === 'right') vars.x = 0;

            gsap.to(elRef.current, vars);
        });

        return () => ctx.revert();
    }, [direction, delay, duration, once]);

    const initialStyles: React.CSSProperties = {
        opacity: 0,
        transform: direction === 'up' ? 'translateY(40px)' :
            direction === 'down' ? 'translateY(-40px)' :
                direction === 'left' ? 'translateX(40px)' :
                    direction === 'right' ? 'translateX(-40px)' : 'none'
    };

    return (
        <div ref={elRef} style={initialStyles} className={className}>
            {children}
        </div>
    );
}
