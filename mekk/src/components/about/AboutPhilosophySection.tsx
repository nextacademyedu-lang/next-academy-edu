'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useSplitText } from '@/hooks/useSplitText';
import styles from './AboutPhilosophySection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutPhilosophySection() {
    const sectionRef = useRef<HTMLElement>(null);
    const imagesRef = useRef<HTMLDivElement>(null);

    const { ref: headlineRef, splitRef: headlineSplit } = useSplitText(['lines', 'words']);
    const { ref: paragraphRef, splitRef: paragraphSplit } = useSplitText(['lines']);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Animate Headline
            requestAnimationFrame(() => {
                if (headlineSplit.current?.words) {
                    gsap.to(headlineSplit.current.words, {
                        y: 0,
                        opacity: 1,
                        duration: 1.2,
                        stagger: 0.05,
                        ease: 'power4.out',
                        scrollTrigger: {
                            trigger: headlineRef.current,
                            start: 'top 80%',
                            toggleActions: 'play reverse play reverse'
                        }
                    });
                }

                // Animate paragraphs
                if (paragraphSplit.current?.lines) {
                    gsap.fromTo(paragraphSplit.current.lines,
                        { opacity: 0.15 },
                        {
                            opacity: 1,
                            stagger: 0.1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: paragraphRef.current,
                                start: 'top 80%',
                                end: 'bottom 60%',
                                scrub: 1,
                            }
                        }
                    );
                }
            });

            // Parallax on images
            if (imagesRef.current) {
                const imgs = imagesRef.current.querySelectorAll('img');
                imgs.forEach(img => {
                    gsap.fromTo(img,
                        { scale: 1.1, yPercent: -5 },
                        {
                            scale: 1,
                            yPercent: 5,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: imagesRef.current,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: true,
                            }
                        }
                    );
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [headlineSplit, paragraphSplit]);

    return (
        <section ref={sectionRef} className={styles.section}>

            {/* Top Text */}
            <div className={styles.topHeader}>
                <div className={styles.topNumber}>(05)</div>
                <h2 className={styles.mainHeadline} ref={headlineRef as any}>
                    <div className="line">I DON&apos;T THEORIZE.</div>
                    <div className="line">I BUILD.</div>
                </h2>
                <div className={styles.topLabel}>
                    ● I architect from lived experience
                </div>
            </div>

            {/* Images Grid */}
            <div className={styles.imagesGrid}>
                <div className={styles.imagesLeft}>
                    <p>● Strategic Systems Architect for High-Growth Startups</p>
                </div>
                <div className={styles.imagesRight} ref={imagesRef}>
                    <div className={styles.imageBox}>
                        <div className={styles.imageOverflow}>
                            <Image src="/images/mekky.png" alt="Mekky building" fill sizes="(max-width: 768px) 100vw, 50vw" />
                        </div>
                        <span className={styles.imageCaption}>"I build from the trenches"</span>
                    </div>
                    <div className={styles.imageBox}>
                        <div className={styles.imageOverflow}>
                            <Image src="/images/hero.png" alt="Mekky processing" fill sizes="(max-width: 768px) 100vw, 50vw" />
                        </div>
                        <span className={styles.imageCaption}>"And I come out with scalable clarity"</span>
                    </div>
                </div>
            </div>

            {/* Content Text Grid */}
            <div className={styles.contentGrid}>
                <div className={styles.contentLeft}>
                    <p>● This is what I&apos;m meant to do.</p>
                </div>
                <div className={styles.contentRight}>
                    <p className={styles.normalText} ref={paragraphRef as any}>
                        Today I architect systems for founders, executives, and high-achieving startups who already look successful on paper but are hitting an operational ceiling. I don&apos;t consult from books or theory.
                    </p>

                    <h3 className={styles.mediumHeadline}>
                        I build from fire. From workflows that fell apart. From campaigns that failed to scale. From fixing broken processes again and again until true clarity finally emerged.
                    </h3>

                    <div className={styles.normalTextStack}>
                        <p>
                            I&apos;ve been building my entire life. As a developer, having logic in my corner wasn&apos;t optional—it was essential. It&apos;s how I pushed limits. How I optimized. How I won.
                        </p>
                        <p>
                            But when I stepped into the marketing world, that systemic structure disappeared. Suddenly, teams were expected to figure it all out on their own, relying purely on manual hustle.
                        </p>
                        <p>
                            No playbook. No automated guardrails. No robust system to hold them through the scaling chaos.
                        </p>
                        <p>
                            And it&apos;s no wonder so many high performers feel stuck. They want to scale but don&apos;t know how to architect it. They worry that relying on tools is lazy, when in truth, it&apos;s the smartest thing you can do.
                        </p>
                    </div>
                </div>
            </div>

            {/* Transition Text */}
            <div className={styles.transitionText}>
                That&apos;s why the teams I work with trust me —<br />
                because I don&apos;t just know what the framework looks like, I&apos;ve built it.
            </div>

        </section>
    );
}
