'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PortfolioProcess.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const STEPS = [
    { num: '01', title: 'AUDIT', sub: 'Diagnosis', desc: 'A deep dive into your metrics, tech architecture, and bottlenecks to identify exactly where you are leaking revenue.' },
    { num: '02', title: 'STRATEGY', sub: 'Architecture', desc: 'Crafting a bespoke system blueprint. No templates. We architect a custom roadmap designed for infinite vertical scaling.' },
    { num: '03', title: 'EXECUTION', sub: 'Deployment', desc: 'Building the high-performance engines that convert. Secure, automated, and hyper-efficient digital infrastructure.' },
    { num: '04', title: 'SCALE', sub: 'Optimization', desc: 'The build is just the beginning. Continuous refinement and automated scaling to dominate your market category.' },
];

export default function PortfolioProcess() {
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current!.querySelectorAll(`.${styles.step}`), {
                y: 100,
                rotateX: -15,
                opacity: 0,
                stagger: 0.2,
                duration: 1.5,
                ease: 'expo.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play reverse play reverse'
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>
                <div className={styles.head}>
                    <span className={styles.eyebrow}>● The Methodology</span>
                    <h2 className={styles.title}>HOW WE BUILD.</h2>
                </div>

                <div className={styles.steps}>
                    {STEPS.map((s, i) => (
                        <div key={i} className={styles.step}>
                            <div className={styles.stepHeader}>
                                <span className={styles.num}>{s.num}</span>
                                <span className={styles.sub}>{s.sub}</span>
                            </div>
                            <div className={styles.body}>
                                <h3 className={styles.stepTitle}>{s.title}</h3>
                                <p className={styles.stepDesc}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
