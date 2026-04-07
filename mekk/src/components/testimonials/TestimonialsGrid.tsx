'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TESTIMONIALS } from '@/lib/constants';
import styles from './TestimonialsGrid.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TestimonialsGrid() {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                gsap.from(card, {
                    y: 60,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 90%',
                        toggleActions: 'play reverse play reverse'
                    },
                    delay: i * 0.1,
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.grid}>
                {TESTIMONIALS.map((t, i) => (
                    <div
                        key={i}
                        ref={(el) => { cardsRef.current[i] = el; }}
                        className={styles.card}
                    >
                        <span className={styles.quoteMark}>&ldquo;</span>
                        <p className={styles.quoteText}>{t.quote}</p>
                        <div className={styles.authorRow}>
                            <div className={styles.authorInfo}>
                                <span className={styles.authorName}>{t.author}</span>
                                <span className={styles.authorRole}>{t.role}</span>
                            </div>
                            <div className={styles.stars}>
                                {Array.from({ length: t.rating }).map((_, s) => (
                                    <span key={s}>★</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
