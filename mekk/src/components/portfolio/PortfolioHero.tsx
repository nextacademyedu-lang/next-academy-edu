'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import SplitType from 'split-type';
import styles from './PortfolioHero.module.css';

export default function PortfolioHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const labelRef = useRef<HTMLSpanElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const tapesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const split = new SplitType(titleRef.current!, { types: 'chars' });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            });

            tl.from(labelRef.current, {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            })
                .from(split.chars, {
                    y: 100,
                    rotateX: -90,
                    opacity: 0,
                    stagger: 0.02,
                    duration: 1,
                    ease: 'expo.out',
                }, '-=0.5')
                .from(subtitleRef.current, {
                    y: 30,
                    opacity: 0,
                    duration: 1,
                    ease: 'power3.out'
                }, '-=0.6');

            if (tapesRef.current) {
                gsap.from(tapesRef.current, {
                    opacity: 0,
                    scaleY: 0,
                    duration: 1.5,
                    ease: 'power4.inOut',
                    delay: 0.5,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse',
                    }
                });
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const tools = [
        'Shopify', 'Zapier', 'n8n', 'Meta', 'OpenAI',
        'React', 'Next.js', 'Supabase',
    ];

    const repeatedTools = [...tools, ...tools, ...tools, ...tools];

    return (
        <div ref={containerRef}>
            {/* ── Hero Text Section ── */}
            <section className={styles.hero}>
                <div className={styles.textContainer}>
                    <span
                        ref={labelRef}
                        className={styles.label}
                    >
                        The Archives
                    </span>

                    <h1
                        ref={titleRef}
                        className={styles.title}
                    >
                        PROOF OF<br />CONCEPT.
                    </h1>

                    <p
                        ref={subtitleRef}
                        className={styles.subtitle}
                    >
                        A curated selection of systems built, brands scaled, and workflows automated.
                    </p>
                </div>
            </section>

            {/* ── Intersecting Tapes Band — Below Hero ── */}
            <section ref={tapesRef} className={styles.tapesSection}>
                <div className={styles.tapesContainer}>
                    {/* Tape 1 — scrolls left */}
                    <div className={`${styles.tape} ${styles.tape1}`}>
                        <div className={styles.trackLeft}>
                            {repeatedTools.map((tool, i) => (
                                <span key={`t1-${i}`}>
                                    <span className={styles.logoItem}>{tool}</span>
                                    <span className={styles.separator}> ✦ </span>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tape 2 — scrolls right */}
                    <div className={`${styles.tape} ${styles.tape2}`}>
                        <div className={styles.trackRight}>
                            {repeatedTools.map((tool, i) => (
                                <span key={`t2-${i}`}>
                                    <span className={styles.logoItem}>{tool}</span>
                                    <span className={styles.separator}> ✦ </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
