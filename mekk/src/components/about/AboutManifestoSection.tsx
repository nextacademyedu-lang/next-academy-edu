'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '@/hooks/useSplitText';
import styles from './AboutManifestoSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutManifestoSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { ref: textRef, splitRef } = useSplitText(['words']);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Need to wait for SplitType to process the DOM
            requestAnimationFrame(() => {
                if (!splitRef.current) return;

                const words = splitRef.current.words;

                if (words && words.length > 0) {
                    // Set initial state because styles might be overriden by split-type
                    gsap.set(words, { opacity: 0, y: 30, filter: 'blur(10px)' });

                    gsap.to(words, {
                        opacity: 1,
                        y: 0,
                        filter: 'blur(0px)',
                        duration: 1.5,
                        stagger: 0.04, // Slight delay between each word
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 75%', // Start animating when section reaches bottom
                            toggleActions: 'play reverse play reverse',
                        }
                    });
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [splitRef]); // Dependency on splitRef ensures it runs after text is split

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.glowBackground} />

            <p ref={textRef as any} className={styles.manifestoText}>
                "I help ambitious businesses and driven individuals transition from manual chaos to intelligent automation. By designing smarter, highly scalable systems, I bridge the critical gap between marketing strategies, emerging technologies, and the people who drive them — turning complex workflows into seamless growth engines."
            </p>
        </section>
    );
}
