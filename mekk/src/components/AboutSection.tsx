'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { ABOUT } from '@/lib/constants';
import { Highlighter } from './magicui/Highlighter';
import styles from './AboutSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const quoteRef = useRef<HTMLParagraphElement>(null);
    const [showHighlight, setShowHighlight] = useState(false);

    useEffect(() => {
        if (!sectionRef.current || !quoteRef.current) return;

        const ctx = gsap.context(() => {
            // Word-by-word reveal on the giant serif quote
            const split = new SplitType(quoteRef.current!, {
                types: 'words',
                tagName: 'span'
            });

            gsap.fromTo(
                split.words,
                { color: 'rgba(255, 252, 242, 0.05)', y: 20 },
                {
                    color: 'rgba(255, 252, 242, 1)',
                    y: 0,
                    stagger: 0.05,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 60%',
                        end: 'center 40%',
                        scrub: 1.2,
                        onEnter: () => {
                            // Delay the highlighter a bit for better visual sequence
                            setTimeout(() => setShowHighlight(true), 800);
                        },
                        onLeaveBack: () => setShowHighlight(false),
                    },
                }
            );

            // Fade in bio paragraphs
            gsap.from(`.${styles.paragraph}`, {
                y: 40,
                opacity: 0,
                stagger: 0.1,
                duration: 1.5,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: `.${styles.bioGrid}`,
                    start: 'top 85%',
                },
            });

            // Fade in CTA
            gsap.from(`.${styles.cta}`, {
                y: 30,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: `.${styles.bioGrid}`,
                    start: 'bottom 90%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="about" className={styles.about}>
            <div className={styles.container}>
                <div className={styles.topMeta}>
                    <span className={styles.sectionNumber}>({ABOUT.sectionNumber})</span>
                    <span className={styles.sectionLabel}>● {ABOUT.sideLabel}</span>
                </div>

                <p ref={quoteRef} className={`${styles.quote} text-serif`}>
                    I build{' '}
                    <Highlighter type="underline" show={showHighlight} color="#EB5E28">
                        smarter
                    </Highlighter>
                    ,{' '}
                    <Highlighter type="highlight" show={showHighlight} color="rgba(235, 94, 40, 0.15)">
                        scalable
                    </Highlighter>{' '}
                    systems — bridging marketing, technology, and people.
                </p>

                <div className={styles.bioGrid}>
                    <p className={styles.paragraph}>
                        I am a{' '}
                        <Highlighter type="underline" show={showHighlight} color="#EB5E28">
                            marketing automation strategist
                        </Highlighter>{' '}
                        and{' '}
                        <Highlighter type="underline" show={showHighlight} color="#EB5E28">
                            performance trainer
                        </Highlighter>{' '}
                        who helps businesses and individuals build smarter, scalable systems.
                    </p>
                    <p className={styles.paragraph}>
                        With years of experience across marketing, automation, and{' '}
                        <Highlighter type="highlight" show={showHighlight} color="rgba(235, 94, 40, 0.1)">
                            AI-driven workflows
                        </Highlighter>
                        , I have empowered startups and teams to grow efficiently and work intelligently.
                    </p>
                    <p className={styles.paragraph}>
                        I bring a unique mix of{' '}
                        <Highlighter type="bracket" show={showHighlight} color="#EB5E28" padding={[2, 4]}>
                            creative strategy
                        </Highlighter>
                        ,{' '}
                        <Highlighter type="bracket" show={showHighlight} color="#EB5E28" padding={[2, 4]}>
                            technical precision
                        </Highlighter>
                        , and{' '}
                        <Highlighter type="bracket" show={showHighlight} color="#EB5E28" padding={[2, 4]}>
                            human-centered training
                        </Highlighter>{' — '}
                        bridging the gap between marketing, technology, and people.
                    </p>
                    <p className={styles.paragraph}>
                        Beyond building systems, I teach them. Through my workshops and lectures, I share practical frameworks for automating marketing, scaling performance, and{' '}
                        <Highlighter type="highlight" show={showHighlight} color="rgba(235, 94, 40, 0.1)">
                            integrating AI
                        </Highlighter>{' '}
                        into real-world workflows.
                    </p>
                </div>

                <a href="/about" className={styles.cta}>
                    See Full Story <span className={styles.ctaArrow}>→</span>
                </a>
            </div>
        </section>
    );
}
