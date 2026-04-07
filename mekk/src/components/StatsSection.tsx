'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STATS } from '@/lib/constants'; 
import styles from './StatsSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function StatsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const numberRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const textLinesRef = useRef<(HTMLParagraphElement | null)[]>([]);
    const statItemsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Text Reveal Animation (Smooth & Clean)
            gsap.fromTo(textLinesRef.current,
                {
                    yPercent: 120,
                    skewY: 3, 
                    opacity: 0,
                },
                {
                    yPercent: 0,
                    skewY: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: 'power3.out', 
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 75%',
                    }
                }
            );

            // Stats Reveal & Counter Animation
            statItemsRef.current.forEach((item, i) => {
                if (!item) return;
                const numberEl = numberRefs.current[i];
                const target = Number(STATS[i]?.number) || 0;
                const counter = { value: 0 };

                gsap.fromTo(item,
                    {
                        y: 30,
                        opacity: 0,
                    },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: `.${styles.grid}`,
                            start: 'top 85%',
                        },
                        delay: i * 0.1 
                    }
                );

                if (numberEl) {
                    gsap.to(counter, {
                        value: target,
                        duration: 2, // سرعنا العداد شوية ليتناسب مع البساطة
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: `.${styles.grid}`,
                            start: 'top 85%',
                        },
                        delay: i * 0.1,
                        onUpdate: () => {
                            numberEl.textContent = Math.round(counter.value).toLocaleString('en-US');
                        },
                    });
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    numberRefs.current = [];
    textLinesRef.current = [];
    statItemsRef.current = [];

    return (
        <section ref={sectionRef} className={styles.stats}>
            <div className={styles.container}>

                <div className={styles.statement}>
                    <div className={styles.lineWrapper}>
                        <p
                            ref={(el) => { textLinesRef.current[0] = el; }}
                            className={styles.serifText}
                        >
                            Don&apos;t just build things.
                        </p>
                    </div>
                    <div className={styles.lineWrapper}>
                        <p
                            ref={(el) => { textLinesRef.current[1] = el; }}
                            className={styles.boldText}
                        >
                            BUILD ENGINES.
                        </p>
                    </div>
                </div>

                <div className={styles.grid}>
                    {STATS.map((stat, i) => {
                        const prefix = 'prefix' in stat ? (stat as any).prefix : '';
                        const suffix = 'suffix' in stat ? (stat as any).suffix : '';

                        return (
                            <div
                                key={`stat-${i}`}
                                ref={(el) => { statItemsRef.current[i] = el; }}
                                className={styles.statItem}
                            >
                                <div className={styles.statNumberGroup}>
                                    {prefix && <span className={styles.prefix}>{prefix}</span>}
                                    <span
                                        ref={(el) => { numberRefs.current[i] = el; }}
                                        className={styles.number}
                                    >
                                        0
                                    </span>
                                    {suffix && <span className={styles.suffix}>{suffix}</span>}
                                </div>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
