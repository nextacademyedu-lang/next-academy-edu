'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import Image from 'next/image';
import styles from './HorizontalScrollGallery.module.css';

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

export default function HorizontalScrollGallery({ items = [] }: { items?: ProjectData[] }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !trackRef.current || items.length === 0) return;

        const track = trackRef.current;
        const totalScrollWidth = track.scrollWidth - window.innerWidth;

        const ctx = gsap.context(() => {
            // Horizontal scroll on vertical scroll
            gsap.to(track, {
                x: -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: () => `+=${totalScrollWidth}`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                },
            });

            // Parallax effect on each card image
            gsap.utils.toArray<HTMLElement>(`.${styles.cardImage}`).forEach((img) => {
                gsap.to(img, {
                    xPercent: -15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: () => `+=${totalScrollWidth}`,
                        scrub: true,
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [items]);

    return (
        <div ref={sectionRef} className={styles.section}>
            {/* Section label */}
            <div className={styles.sideLabel}>
                <span>SCROLL →</span>
            </div>

            {/* Horizontal track */}
            <div ref={trackRef} className={styles.track}>
                {items.map((project, i) => (
                    <Link
                        href={`/portfolio/${project.slug}`}
                        key={i}
                        className={styles.card}
                    >
                        {/* Number */}
                        <span className={styles.cardNumber}>
                            {String(i + 1).padStart(2, '0')}
                        </span>

                        {/* Image */}
                        <div className={styles.cardImageWrapper}>
                            <Image
                                src={project.image}
                                alt={project.title}
                                className={styles.cardImage}
                                fill
                                sizes="60vw"
                            />
                            <div className={styles.cardOverlay} />
                        </div>

                        {/* Info */}
                        <div className={styles.cardInfo}>
                            <span
                                className={styles.cardCategory}
                                style={{ color: project.color }}
                            >
                                {project.category}
                            </span>
                            <h3 className={styles.cardTitle}>{project.title}</h3>
                            <p className={styles.cardDesc}>{project.description}</p>
                            <div className={styles.cardArrow}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Accent border */}
                        <div
                            className={styles.cardAccent}
                            style={{ backgroundColor: project.color }}
                        />
                    </Link>
                ))}

                {/* End spacer */}
                <div className={styles.endSpacer} />
            </div>
        </div>
    );
}
