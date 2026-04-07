'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CaseStudiesHero.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function CaseStudiesHero() {
    const sectionRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current!.querySelectorAll('[data-reveal]'), {
                y: 80, opacity: 0, duration: 1.4,
                stagger: 0.1, ease: 'expo.out', delay: 0.1,
            });
            if (bgRef.current) {
                gsap.to(bgRef.current, {
                    yPercent: 25,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.hero}>
            <div ref={bgRef} className={styles.bgNumber} aria-hidden>04</div>

            <div className={styles.topMeta}>
                <span className={styles.sectionNum} data-reveal>(04)</span>
                <span className={styles.sectionLabel} data-reveal>● Case Studies</span>
            </div>

            <div className={styles.titleBlock}>
                <span className={styles.subline} data-reveal>Problems Solved. Results Delivered.</span>
                <h1 className={styles.title} data-reveal>
                    <span className={styles.titleLine}>DEEP</span>
                    <span className={`${styles.titleLine} ${styles.titleLineAccent}`}>DIVES.</span>
                </h1>
            </div>

            <p className={styles.descriptor} data-reveal>
                Full breakdowns of how we diagnosed, built, and scaled each solution.
            </p>

            <div className={styles.scrollHint} data-reveal>
                <span className={styles.scrollLine} />
                <span className={styles.scrollText}>Scroll</span>
            </div>
        </section>
    );
}
