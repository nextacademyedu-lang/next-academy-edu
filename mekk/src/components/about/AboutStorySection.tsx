'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe } from '@/components/magicui/Globe';
import styles from './AboutStorySection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutStorySection() {
    const sectionRef = useRef<HTMLElement>(null);
    const globeContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !globeContainerRef.current) return;

        const ctx = gsap.context(() => {
            // Pin the section and scale up the globe on scroll
            gsap.to(globeContainerRef.current, {
                scale: 2.5, // Scale up to cover more of the screen
                yPercent: -30, // Move it up from the bottom
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=100%', // Pin duration
                    pin: true,
                    scrub: 1, // Smooth scrub
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.textContent}>
                <p className={styles.introText}>
                    To understand how I build systems and train teams, you need to know where it all began.
                </p>

                <h2 className={styles.headline}>WANT THE FULL STORY?</h2>

                <p className={styles.keepReading}>
                    Keep reading.
                </p>
            </div>

            <div className={styles.globeContainer} ref={globeContainerRef}>
                <div className={styles.globeWrapper}>
                    <Globe />
                </div>
            </div>
        </section>
    );
}
