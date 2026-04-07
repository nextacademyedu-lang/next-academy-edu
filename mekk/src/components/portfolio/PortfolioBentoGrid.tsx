'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import styles from './PortfolioBentoGrid.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ProjectData {
    title: string;
    slug: string;
    category: string;
    description: string;
    image: string;
    color: string;
}

export default function PortfolioBentoGrid({ items = [] }: { items?: ProjectData[] }) {
    const sectionRef = useRef<HTMLElement>(null);
    const cardsRef = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Stagger reveal for each card
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
                    },
                    delay: i * 0.08,
                });
            });

            // Parallax on images inside cards
            gsap.utils.toArray<HTMLElement>(`.${styles.cardImage}`).forEach((img) => {
                gsap.to(img, {
                    yPercent: 15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest(`.${styles.card}`),
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.sectionTitle}>Selected Work</h2>
                <span className={styles.sectionNumber}>({items.length < 10 ? `0${items.length}` : items.length})</span>
            </div>

            <div className={styles.grid}>
                {items.map((project, i) => (
                    <Link
                        href={`/portfolio/${project.slug}`}
                        key={i}
                        ref={(el) => { cardsRef.current[i] = el; }}
                        className={styles.card}
                    >
                        {/* Accent bar */}
                        <div
                            className={styles.cardAccent}
                            style={{ backgroundColor: project.color }}
                        />

                        {/* VIEW badge on hover */}
                        <span className={styles.viewHint}>VIEW</span>

                        {/* Image */}
                        <div className={styles.cardImageWrapper}>
                            <Image
                                src={project.image}
                                alt={project.title}
                                className={styles.cardImage}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className={styles.cardOverlay} />
                        </div>

                        {/* Bottom info */}
                        <div className={styles.cardInfo}>
                            <span className={styles.cardCategory}>{project.category}</span>
                            <h3 className={styles.cardTitle}>{project.title}</h3>
                            <p className={styles.cardDesc}>{project.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
