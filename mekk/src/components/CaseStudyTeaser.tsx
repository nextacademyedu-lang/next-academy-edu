'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import styles from './CaseStudyTeaser.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function CaseStudyTeaser() {
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // GSAP هيجيب كل العناصر اللي واخدة الكلاس ده جوه السيكشن ده بس
            gsap.fromTo('.gsap-reveal',
                { 
                    y: 40, 
                    opacity: 0,
                    skewY: 2 
                },
                {
                    y: 0,
                    opacity: 1,
                    skewY: 0,
                    duration: 1,
                    ease: "power3.out",
                    stagger: 0.15, 
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 75%",
                    }
                }
            );
        }, containerRef); // تمرير الـ containerRef هنا هو اللي بيمنع تداخل الكلاسات

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className={styles.section} id="featured-case-study">
            <div className={styles.container}>

                <div className={styles.revealWrapper}>
                    {/* ضفنا الكلاس gsap-reveal جنب كلاسات الستايل */}
                    <span className={`${styles.tagLabel} gsap-reveal`}>FEATURED CASE STUDY</span>
                </div>

                <div className={styles.revealWrapper}>
                    <h2 className={`${styles.headline} gsap-reveal`}>
                        Scaling a D2C Leather Brand via Omni-channel Optimization
                    </h2>
                </div>

                <div className={styles.storyWrapper}>
                    <div className={styles.revealWrapper}>
                        <p className={`${styles.paragraph} gsap-reveal`}>
                            A leading agency was losing 40% of their sales pipeline purely because their tracking systems were broken. Leads fell into a black hole, follow-ups were entirely manual, and the sales team was operating blind.
                        </p>
                    </div>
                    <div className={styles.revealWrapper}>
                        <p className={`${styles.paragraph} gsap-reveal`}>
                            We stepped in. We audited the chaos, mapped the entire customer journey, and deployed an iron-clad automation architecture. <strong>The result? A 40% immediate jump in close rates</strong> without spending a single extra dollar on ads.
                        </p>
                    </div>
                </div>

                {/* حطينا اللينك جوه div واخد الكلاس عشان الأنيميشن يطبق عليه صح */}
                <div className="gsap-reveal">
                    <Link href="/case-studies" className={styles.ctaButton}>
                        READ THE FULL BREAKDOWN
                    </Link>
                </div>

            </div>
        </section>
    );
}
