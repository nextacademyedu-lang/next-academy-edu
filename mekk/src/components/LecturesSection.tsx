'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { LECTURES } from '@/lib/constants';
import styles from './LecturesSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LecturesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !titleRef.current) return;

        const ctx = gsap.context(() => {
            gsap.from(`.${styles.row}`, {
                y: 60,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: `.${styles.list}`,
                    start: 'top 80%',
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.lectures}>
            <div className={styles.container}>
                <div className={styles.topMeta}>
                    <span className={styles.sectionLabel}>● Workshops & Speaking</span>
                </div>

                <h2 ref={titleRef} className={styles.title}>
                    LIVE.
                </h2>

                <div className={styles.list}>
                    {LECTURES.map((lecture, i) => (
                        <div key={i} className={styles.row}>
                            <Link href={`/lectures/${lecture.slug}`} className={styles.absoluteLink} aria-label={lecture.title}></Link>
                            <div className={styles.left}>
                                <span className={styles.index}>0{i + 1}</span>
                                <h3 className={styles.lectureTitle}>{lecture.title}</h3>
                            </div>
                            <div className={styles.right}>
                                <p className={styles.lectureDesc}>{lecture.description}</p>
                                <span className={styles.arrow}>↗</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
