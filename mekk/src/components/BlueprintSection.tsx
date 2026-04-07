'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './BlueprintSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
    {
        number: '01',
        title: 'THE AUDIT',
        description: 'A ruthless dissection of your current operations. We find the bottlenecks, the hidden costs, and the manual tasks draining your team\'s energy.',
    },
    {
        number: '02',
        title: 'THE ARCHITECT',
        description: 'Designing a bespoke, scalable system. We don\'t just throw tools at problems; we build a strategic infrastructure tailored to your exact growth goals.',
    },
    {
        number: '03',
        title: 'THE AUTOMATION',
        description: 'Deploying the invisible workforce. Systems talk to each other, repetitive tasks vanish, and your team finally focuses on high-impact revenue generation.',
    }
];

export default function BlueprintSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // 1. Animate the connecting line drawing down
            if (lineRef.current) {
                gsap.fromTo(lineRef.current,
                    { scaleY: 0 },
                    {
                        scaleY: 1,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: 'top center',
                            end: 'bottom 20%',
                            scrub: true,
                        }
                    }
                );
            }

            // 2. Animate each step with a Staggered reveal
            stepsRef.current.forEach((step) => {
                if (!step) return;
                
                // Select elements inside the step to stagger them
                const elementsToAnimate = step.querySelectorAll(`.${styles.numberWrapper}, .${styles.stepTitle}, .${styles.stepDesc}`);

                gsap.fromTo(elementsToAnimate,
                    {
                        opacity: 0,
                        x: -20, // Slide in from the left slightly
                    },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.6,
                        stagger: 0.15, // Elements appear one after another
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: step,
                            start: 'top 75%',
                            toggleActions: 'play none none reverse',
                            onEnter: () => {
                                // Add class to trigger CSS glows and hollow number fills
                                step.classList.add(styles.active);
                            },
                            onLeaveBack: () => {
                                step.classList.remove(styles.active);
                            }
                        }
                    }
                );
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Reset array to prevent memory leaks in dev mode
    stepsRef.current = [];

    return (
        <section ref={sectionRef} className={styles.section} id="blueprint">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>THE BLUEPRINT</h2>
                    <p className={styles.subtitle}>My proven framework to replace chaos with clarity.</p>
                </div>

                <div className={styles.timeline}>
                    <div ref={lineRef} className={styles.progressLine}></div>

                    {STEPS.map((step, index) => (
                        <div
                            key={step.number}
                            ref={(el) => { stepsRef.current[index] = el; }}
                            className={styles.stepRoot}
                        >
                            <div className={styles.numberWrapper}>
                                <span className={styles.number}>{step.number}</span>
                                <div className={styles.dot}></div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.stepTitle}>{step.title}</h3>
                                <p className={styles.stepDesc}>{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
