'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutKeywordsSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const keywords = [
    "Development",
    "Logic",
    "Systems",
    "Automation",
    "Growth"
];

export default function AboutKeywordsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !containerRef.current) return;

        const words = gsap.utils.toArray<HTMLElement>(`.${styles.wordItem}`);

        const ctx = gsap.context(() => {
            // Pin the section and scrub the words
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=150%', // Pin for 1.5x screen height
                    pin: true,
                    scrub: 1,
                }
            });

            words.forEach((word) => {
                // Smooth Y-axis reveal as you scroll (Masked Text Reveal)
                tl.to(word, {
                    y: '0%',
                    duration: 1,
                    ease: 'power1.out',
                }, "-=0.3"); // Overlap slightly for a smoother flow between words
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.wordContainer} ref={containerRef}>
                {keywords.map((word, index) => (
                    <div key={index} className={styles.wordWrapper}>
                        <div className={styles.wordItem}>
                            {word}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
