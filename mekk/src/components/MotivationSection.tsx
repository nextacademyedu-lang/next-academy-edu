'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './MotivationSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function MotivationSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const blurRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // The Blur text animation
            gsap.to(blurRefs.current, {
                filter: 'blur(12px)',
                opacity: 0.8,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 50%',
                    end: 'center 40%',
                    scrub: 1,
                }
            });

            // Slight parallax on the image
            if (imageRef.current) {
                gsap.to(imageRef.current, {
                    yPercent: 15,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: true,
                    }
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>

                <div className={styles.imageWrapper}>
                    {/* Placeholder image, user needs to replace with actual portrait */}
                    <Image
                        ref={imageRef}
                        src="/images/mekky_motevation.webp"
                        alt="Muhammed Mekky"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={styles.image}
                    />
                </div>

                <div className={styles.textWrapper}>
                    {/* First Line: DO (sharp) + N'T (blur) */}
                    <div className={styles.textLine}>
                        <span className={styles.sharpPart}>DO</span>
                        <span
                            ref={(el) => { blurRefs.current[0] = el; }}
                            className={styles.blurPart}
                        >
                            N&apos;T
                        </span>
                    </div>

                    {/* Second Line: QU (blur) + IT (sharp) */}
                    <div className={styles.textLine}>
                        <span
                            ref={(el) => { blurRefs.current[1] = el; }}
                            className={styles.blurPart}
                        >
                            QU
                        </span>
                        <span className={styles.sharpPart}>IT</span>
                    </div>
                </div>

            </div>

            <div className={styles.bottomDetails}>
                <div className={styles.captionWrapper}>
                    <span className={styles.captionTitle}>IT STARTS WITH A SINGLE CONVERSATION</span>
                    <span className={styles.captionText}>
                        No fluff, just strategy. My consultations are deep, strategic conversations where you&apos;ll walk away with clarity, insight, and momentum, whether we work together or not.
                    </span>
                </div>
            </div>
        </section>
    );
}
