'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '@/hooks/useSplitText';
import Link from 'next/link';
import styles from './AboutContactSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutContactSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { ref: headlineRef, splitRef: headlineSplit } = useSplitText(['chars']);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            if (headlineSplit.current?.chars) {
                gsap.fromTo(headlineSplit.current.chars,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        stagger: 0.05,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top 75%',
                            toggleActions: 'play reverse play reverse',
                        }
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [headlineSplit]);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <div className={styles.number}>(06)</div>
                    <div className={styles.titleWrapper}>
                        <h2 className={styles.headline} ref={headlineRef as any}>
                            WORK WITH ME
                        </h2>
                        <div className={styles.verticalText}>
                            AVAILABLE FOR NEW PROJECTS
                        </div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.topLabel}>
                        ● Let&apos;s build your breakthrough
                    </div>

                    <div className={styles.content}>
                        <p className={styles.smallText}>
                            I consult and architect systems for ambitious startups, agencies, and driven individuals across the world.
                        </p>

                        <h3 className={styles.offerText}>
                            If you&apos;re ready to reinvent, rebuild, or simply optimize what&apos;s already working, let&apos;s begin the conversation.
                        </h3>

                        <Link href="#contact" className={styles.ctaButton}>
                            Explore Collaboration
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.bottomList}>
                <div className={styles.listTitle}>Muhammed Mekky</div>
                <ul className={styles.bulletList}>
                    <li>● Automation & Product Architect</li>
                    <li>● Co-Founder at Green Studio 9</li>
                    <li>● Former Marketing & Operations Lead</li>
                    <li>● Community Leader of 900+</li>
                    <li>● Logic-driven System Builder</li>
                </ul>
            </div>
        </section>
    );
}
