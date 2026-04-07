'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './TestimonialsStats.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const STATS = [
    { number: '+84', label: 'Projects Delivered' },
    { number: '+50', label: 'Clients Worldwide' },
    { number: '+7', label: 'Years Experience' },
    { number: '2400+', label: 'People Impacted' },
];

export default function TestimonialsStats() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            const items = sectionRef.current!.querySelectorAll('[data-stat]');
            items.forEach((item) => {
                gsap.from(item, {
                    y: 50, opacity: 0, duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: item, start: 'top 85%' },
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.inner}>
                <div className={styles.labelRow}>
                    <span className={styles.label}>● The Numbers</span>
                    <div className={styles.divider} />
                </div>

                <div className={styles.statsGrid}>
                    {STATS.map((s, i) => (
                        <div key={i} className={styles.statItem} data-stat>
                            <span className={styles.statNum}>{s.number}</span>
                            <span className={styles.statLabel}>{s.label}</span>
                        </div>
                    ))}
                </div>

                <p className={styles.note}>
                    Not a coincidence. A system.
                </p>
            </div>
        </section>
    );
}
