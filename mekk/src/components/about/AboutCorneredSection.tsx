'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '@/hooks/useSplitText';
import styles from './AboutCorneredSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutCorneredSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { ref: quoteRef, splitRef: quoteSplit } = useSplitText(['words']);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            if (quoteSplit.current?.words) {
                // Scrubbing text reveal effect
                gsap.to(quoteSplit.current.words, {
                    opacity: 1, // Base CSS makes them 0.2
                    stagger: 0.1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 50%',
                        end: 'bottom 80%',
                        scrub: 1, // Smooth scrub
                    }
                });

                // Subtle parallax for the giant quote mark
                const quoteMark = sectionRef.current?.querySelector(`.${styles.quoteMark}`);
                if (quoteMark) {
                    gsap.fromTo(quoteMark,
                        { y: 50 },
                        {
                            y: -50,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: sectionRef.current,
                                start: 'top bottom',
                                end: 'bottom top',
                                scrub: true
                            }
                        }
                    );
                }
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [quoteSplit]);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.quoteWrapper}>
                <div className={styles.quoteMark}>"</div>
                <h2 className={styles.quoteText} ref={quoteRef as any}>
                    So I did what I always<br />
                    do when faced with complexity:<br />
                    I built a system for it.
                </h2>
            </div>

            <div className={styles.bottomRightLabel}>
                Architecting<br />
                Growth
            </div>
        </section>
    );
}
