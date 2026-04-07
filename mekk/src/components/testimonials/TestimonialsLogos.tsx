'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './TestimonialsLogos.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const LOGOS = [
    { name: 'Google', letter: 'G' },
    { name: 'Meta', letter: 'M' },
    { name: 'Shopify', letter: 'S' },
    { name: 'Notion', letter: 'N' },
    { name: 'HubSpot', letter: 'H' },
    { name: 'Zapier', letter: 'Z' },
    { name: 'n8n', letter: 'n8' },
    { name: 'Make', letter: 'Mk' },
];

export default function TestimonialsLogos() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current!.querySelectorAll('[data-logo]'), {
                y: 30, opacity: 0, duration: 0.8,
                stagger: 0.06, ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 85%',
                    toggleActions: 'play reverse play reverse'
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <p className={styles.label}>Tools & Platforms I Work With</p>
            <div className={styles.grid}>
                {LOGOS.map((logo, i) => (
                    <div key={i} className={styles.logoItem} data-logo>
                        <span className={styles.logoLetter}>{logo.letter}</span>
                        <span className={styles.logoName}>{logo.name}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
