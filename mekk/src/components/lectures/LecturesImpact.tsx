'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ScrollHighlight from '@/components/ui/ScrollHighlight';
import styles from './LecturesImpact.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const STATS = [
    { number: '2400+', label: 'Registered Learners' },
    { number: '06', label: 'Unique Workshops' },
    { number: '4.9/5', label: 'Average Satisfaction' },
    { number: '50+', label: 'Teams Trained' },
];

export default function LecturesImpact() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current!.querySelectorAll(`.${styles.statItem}`), {
                y: 50,
                opacity: 0,
                stagger: 0.15,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>
                <div className={styles.head}>
                    <span className={styles.eyebrow}>● Speaking at a glance</span>
                    <h2 className={styles.title}>
                        IMPACT IN <ScrollHighlight>NUMBERS.</ScrollHighlight>
                    </h2>
                </div>

                <div className={styles.grid}>
                    {STATS.map((s, i) => (
                        <div key={i} className={styles.statItem}>
                            <span className={styles.statLine} />
                            <div className={styles.statBody}>
                                <span className={styles.num}>{s.number}</span>
                                <span className={styles.label}>{s.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.footerNote}>
                    <p>Designed for immediate application, not just inspiration.</p>
                </div>
            </div>
        </section>
    );
}
