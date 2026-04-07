/* ═══════════════════════════════════════
   LECTURES CTA SECTION
   ═══════════════════════════════════════ */

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE } from '@/lib/constants';
import styles from './LecturesCTA.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function LecturesCTA() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current!.querySelectorAll('[data-reveal]'), {
                y: 50, opacity: 0, duration: 1.2,
                stagger: 0.12, ease: 'expo.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    toggleActions: 'play reverse play reverse'
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.inner}>
                <span className={styles.eyebrow} data-reveal>● Book a Workshop</span>
                <h2 className={styles.heading} data-reveal>
                    BRING THIS TO<br />
                    <span className={styles.outlined}>YOUR TEAM.</span>
                </h2>
                <p className={styles.body} data-reveal>
                    All workshops are available for corporate teams, communities, and events.
                    Customized for your context, delivered live — online or in person.
                </p>
                <div className={styles.actions} data-reveal>
                    <a href={`mailto:${SITE.email}`} className={styles.btnPrimary}>
                        Let&apos;s Talk →
                    </a>
                    <a href="/about" className={styles.btnSecondary}>
                        About Mekky
                    </a>
                </div>
            </div>
        </section>
    );
}
