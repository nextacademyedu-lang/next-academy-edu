'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LECTURES } from '@/lib/constants';
import styles from './LecturesList.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function LecturesList() {
    const sectionRef = useRef<HTMLElement>(null);
    const rowsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            rowsRef.current.forEach((row) => {
                if (!row) return;

                // Row content reveal
                gsap.from(row, {
                    y: 50, opacity: 0, duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: row, start: 'top 85%' },
                });

                // Image parallax
                const img = row.querySelector(`.${styles.image}`);
                if (img) {
                    gsap.to(img, {
                        yPercent: 15,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: row,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        },
                    });
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.list}>
                {LECTURES.map((lecture, i) => (
                    <div
                        key={i}
                        ref={(el) => { rowsRef.current[i] = el; }}
                        className={styles.row}
                    >
                        <div className={styles.imageWrapper}>
                            <Image
                                src={lecture.image}
                                alt={lecture.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                className={styles.image}
                            />
                        </div>
                        <div className={styles.content}>
                            <span className={styles.index}>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className={styles.lectureTitle}>{lecture.title}</h3>
                            <p className={styles.lectureDesc}>{lecture.description}</p>
                            <a href={`/lectures/${lecture.slug}`} className={styles.watchLink}>
                                Watch Workshop <span className={styles.arrow}>→</span>
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
