'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './AboutHeroSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutHeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !textRef.current || !imageRef.current) return;

        const ctx = gsap.context(() => {
            // Pin the Hero Section and animate the Giant Text up
            gsap.to(textRef.current, {
                y: '-65vh', // Moves the text up to center over the image
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=150%', // Pin lasts for 1.5x viewport height
                    pin: true,
                    scrub: 1, // Smooth scrolling effect
                }
            });

            // Parallax effect on the image itself
            gsap.to(imageRef.current, {
                yPercent: 20, // Image moves slightly slower than the scroll
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: '+=150%', // Matches the pin duration
                    scrub: true,
                }
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.hero}>

            <div className={styles.sideInfoLeft}>
                <span className={styles.infoLine}>MARKETING AUTOMATION</span>
                <span className={styles.infoLine}>STRATEGIST TO AMBITIOUS TEAMS</span>
                <span className={styles.infoLine}>PERFORMANCE TRAINER</span>
            </div>

            <div className={styles.imageWrapper} ref={imageRef}>
                <Image
                    src="/images/mekky.png"
                    alt="Muhammed Mekky Portrait"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.image}
                />
            </div>

            <div className={styles.sideInfoRight}>
                <span className={styles.infoLine}>BASED IN EGYPT</span>
                <span className={styles.infoLine}>WORKING GLOBALLY</span>
                <span className={styles.infoLine}>7+ YEARS EXP.</span>
            </div>

            {/* Starts hidden at bottom (-40vh) and translates up to center */}
            <div className={styles.giantTextWrapper} ref={textRef}>
                <span className={styles.giantText}>THE STRATEGY</span>
                <span className={styles.giantText}>BEHIND THE SYSTEM</span>
            </div>

        </section>
    );
}
