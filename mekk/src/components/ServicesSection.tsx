'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { SERVICES } from '@/lib/constants';
import styles from './ServicesSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function ServicesSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !headerRef.current) return;

        const ctx = gsap.context(() => {
            const split = new SplitType(headerRef.current!, { types: 'chars' });

            gsap.from(split.chars, {
                y: '100%',
                opacity: 0,
                stagger: 0.02,
                duration: 1.2,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: 'top 85%',
                },
            });

            gsap.from(`.${styles.serviceItem}`, {
                opacity: 0,
                x: -50,
                stagger: 0.1,
                duration: 1,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: `.${styles.list}`,
                    start: 'top 70%',
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} id="services" className={styles.services}>
            <div className={styles.container}>
                <div className={styles.topMeta}>
                    <span className={styles.sectionNumber}>({SERVICES.sectionNumber})</span>
                    <span className={styles.sectionLabel}>● {SERVICES.sideLabel}</span>
                </div>

                <h2 ref={headerRef} className={styles.title}>
                    <span>CAPABILITIES.</span>
                </h2>

                <div className={styles.list}>
                    {SERVICES.items.map((service, i) => (
                        <div key={i} className={styles.serviceItem}>
                            <div className={styles.serviceHeader}>
                                <span className={styles.serviceIndex}>0{i + 1}</span>
                                <h3 className={styles.serviceTitle}>{service.title}</h3>
                            </div>
                            <p className={styles.serviceDesc}>{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
