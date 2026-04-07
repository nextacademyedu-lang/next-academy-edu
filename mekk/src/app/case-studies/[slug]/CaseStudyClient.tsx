'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import styles from '@/app/DetailPage.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface CaseStudyData {
    title: string;
    slug: string;
    category: string;
    description: string;
    image: string;
    challenge: string;
    solution: string;
    results: string[];
    metrics?: MetricDefinition[];
}

export default function CaseStudyClient({ study }: { study: CaseStudyData }) {
    const heroRef = useRef<HTMLElement>(null);
    const challengeRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!heroRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(heroRef.current!.querySelectorAll('[data-reveal]'), {
                y: 60, opacity: 0, duration: 1.2,
                stagger: 0.12, ease: 'expo.out', delay: 0.2,
            });

            // Challenge block reveal
            if (challengeRef.current) {
                gsap.from(challengeRef.current.children, {
                    y: 40, opacity: 0, duration: 1,
                    stagger: 0.1, ease: 'power3.out',
                    scrollTrigger: { trigger: challengeRef.current, start: 'top 80%' },
                });
            }

            // Results block reveal
            if (resultsRef.current) {
                gsap.from(resultsRef.current.children, {
                    y: 40, opacity: 0, duration: 1,
                    stagger: 0.1, ease: 'power3.out',
                    scrollTrigger: { trigger: resultsRef.current, start: 'top 80%' },
                });
            }
        }, heroRef);
        return () => ctx.revert();
    }, []);

    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero */}
                <section ref={heroRef} className={`${styles.hero} ${styles.heroDark}`}>
                    <div className={styles.heroImageWrapper}>
                        <Image src={study.image} alt={study.title} fill sizes="100vw" className={styles.heroImage} priority />
                        <div className={styles.heroOverlay} />
                    </div>
                    <div className={styles.heroContent}>
                        <a href="/case-studies" className={styles.backLink} data-reveal>← Back to Case Studies</a>
                        <span className={styles.category} data-reveal>{study.category}</span>
                        <h1 className={styles.title} data-reveal>{study.title}</h1>
                    </div>
                </section>

                {/* Challenge — Dark */}
                <div className={styles.body}>
                    <div className={styles.bodyInner} ref={challengeRef}>
                        <div className={styles.sectionBlock}>
                            <span className={styles.sectionLabel}>The Challenge</span>
                            <p className={styles.bodyText}>{study.challenge}</p>
                        </div>
                        <div className={styles.sectionBlock}>
                            <span className={styles.sectionLabel}>The Solution</span>
                            <p className={styles.bodyText}>{study.solution}</p>
                        </div>
                    </div>
                </div>

                {/* Results — Light */}
                <div className={styles.lightBlock}>
                    <div className={styles.lightBlockInner} ref={resultsRef}>
                        <span className={styles.lightLabel}>The Results</span>
                        <ul className={styles.lightResultsList}>
                            {study.results.map((result, i) => (
                                <li key={i} className={styles.lightResultItem}>
                                    <span className={styles.lightBullet}>✦</span>
                                    {result}
                                </li>
                            ))}
                        </ul>

                        {/* Interactive Data Visualization */}
                        {study.metrics && study.metrics.length > 0 && (
                            <MetricsCharts metrics={study.metrics} />
                        )}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className={styles.bottomCta}>
                    <p className={styles.ctaText}>Want similar results for your business?</p>
                    <a href={`mailto:${SITE.email}`} className={styles.ctaLink}>
                        Let&apos;s Talk →
                    </a>
                </div>

                <FooterSection />
            </div>
        </>
    );
}
