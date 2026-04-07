'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import ScrollHighlight from '@/components/ui/ScrollHighlight';
import styles from './PortfolioStatement.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function PortfolioStatement() {
    const sectionRef = useRef<HTMLElement>(null);
    const headlineRef = useRef<HTMLDivElement>(null);
    const subtextRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !headlineRef.current || !subtextRef.current) return;

        const ctx = gsap.context(() => {
            // Per-word reveal with SplitType for headline
            const hSplit = new SplitType(headlineRef.current!, { types: 'words', tagName: 'span' });

            gsap.from(hSplit.words, {
                yPercent: 110,
                opacity: 0,
                skewY: 3,
                duration: 1.1,
                ease: 'expo.out',
                stagger: 0.07,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%', // trigger a bit later
                    once: true // just play it once
                },
            });

            // "Painting" reveal for subtext
            const sSplit = new SplitType(subtextRef.current!, { types: 'words' });
            gsap.from(sSplit.words, {
                opacity: 0.1,
                stagger: 0.1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: subtextRef.current,
                    start: 'top 95%',
                    end: 'bottom 60%',
                    scrub: true,
                }
            });

            // Side text parallax
            const sideText = sectionRef.current!.querySelector(`.${styles.verticalText}`);
            if (sideText) {
                gsap.to(sideText, {
                    yPercent: -20,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            {/* Vertical side label */}
            <span className={styles.verticalText} aria-hidden>EXECUTION</span>

            <span className={styles.sectionNumber}>(05)</span>
            <span className={styles.sideNote}>
                <span className={styles.dot} />
                I architect from lived experience
            </span>

            {/* Word-by-word reveal */}
            <div className={styles.textWrapper}>
                <div className={styles.headlineBlock} ref={headlineRef}>
                    <div className={styles.lineWrapper}>
                        <span className={styles.statementLine}>I DON&apos;T</span>
                    </div>
                    <div className={styles.lineWrapper}>
                        <span className={styles.statementLine}>THEORIZE.</span>
                    </div>
                    <div className={`${styles.lineWrapper}`}>
                        <span className={`${styles.statementLine} ${styles.bold}`}>
                            I <ScrollHighlight>BUILD.</ScrollHighlight>
                        </span>
                    </div>
                </div>
            </div>

            <p ref={subtextRef} className={styles.subtext}>
                Every system I teach, I&apos;ve already built. Every framework I share, I&apos;ve already tested.
                No theory. Just proven patterns.
            </p>
        </section>
    );
}
