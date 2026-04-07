'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '@/hooks/useSplitText';
import styles from './AboutTimelineSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const chapters = [
    {
        number: "01",
        title: "THE FOUNDATION (2018–2021)",
        text: [
            "My journey began in the trenches of digital marketing and content creation. I spent my early years understanding how online communities function and what makes campaigns click.",
            "Working as a moderator and social media specialist, I learned the crucial human element of digital growth—what grabs attention and what keeps users engaged.",
            "But I quickly realized that scaling these efforts manually a recipe for burnout. Effort alone wasn't enough."
        ]
    },
    {
        number: "02",
        title: "THE MARKETING ENGINE (2021–2024)",
        text: [
            "I stepped up to lead marketing and advertising efforts at companies like Curva and oversee operations at Scarpe.",
            "I was managing cross-channel campaigns, analyzing KPIs, leading creative teams, and optimizing web experiences to drive actual ROI.",
            "It was here that I saw the recurring bottleneck: businesses hit a ceiling when their marketing operations rely solely on human bandwidth. The system was broken."
        ]
    },
    {
        number: "03",
        title: "THE AUTOMATION SHIFT (2024–2025)",
        text: [
            "The frustration with inefficient scaling led me straight to AI and process automation. At Qudraat, I transitioned into an AI & Operations Lead.",
            "I stopped just running campaigns and started building workflows. By integrating cutting-edge AI tools into daily operations, we boosted efficiency by over 40%.",
            "This was the turning point. I realized I didn't want to just be a marketer; I wanted to architect the logic that makes marketing effortless."
        ]
    },
    {
        number: "04",
        title: "ARCHITECTING GROWTH (2025–PRESENT)",
        text: [
            "I co-founded Green Studio 9, blending creative strategy with smart automation. But my technical depth pushed me further into software architecture.",
            "Today, as a Senior Automation Specialist & Product Architect at ValueIMS, I design the 'brain' of SaaS applications.",
            "Using Next.js and low-code infrastructure, I build the complex logic flows and scalable architectures that act as the unseen engine behind massive digital products."
        ]
    },
    {
        number: "05",
        title: "BRIDGING THE DIGITAL GAP",
        text: [
            "Building systems is powerful, but empowering people is transformative. I partnered with the Ministry of Culture and Ministry of Youth & Sports to bring AI literacy to hundreds of Egyptian youth.",
            "I founded a 900+ member tech community to demystify complex automation concepts, translating high-level tech into accessible, actionable strategies.",
            "My strength lies in this duality: architecting complex code in the morning, and teaching a non-technical audience how to wield it in the afternoon."
        ]
    }
];

export default function AboutTimelineSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const { ref: quoteRef, splitRef: quoteSplit } = useSplitText(['lines']);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Animate each timeline item
            const items = gsap.utils.toArray<HTMLElement>(`.${styles.timelineItem}`);

            items.forEach((item) => {
                // Line animation
                gsap.fromTo(item,
                    { borderTopColor: 'rgba(0,0,0,0)' },
                    {
                        borderTopColor: 'rgba(0,0,0,0.2)',
                        duration: 1,
                        ease: 'power1.inOut',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 80%',
                        }
                    }
                );

                // Content animation
                const number = item.querySelector(`.${styles.itemNumber}`);
                const title = item.querySelector(`.${styles.itemTitle}`);
                const body = item.querySelector(`.${styles.itemBody}`);

                gsap.fromTo([number, title, body],
                    { y: 50, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 75%',
                        }
                    }
                );
            });

            // Animate Quote
            if (quoteSplit.current?.lines) {
                gsap.fromTo(quoteSplit.current.lines,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        stagger: 0.1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: quoteRef.current,
                            start: 'top 80%',
                        }
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [quoteSplit]);

    return (
        <section ref={sectionRef} className={styles.section}>
            {chapters.map((chapter, index) => (
                <div key={index} className={styles.timelineItem}>
                    <h3 className={styles.itemNumber}>{chapter.number}</h3>
                    <div className={styles.itemContentRight}>
                        <div className={styles.itemHeaderRow}>
                            <h4 className={styles.itemTitle}>{chapter.title}</h4>
                            <div className={styles.itemBody}>
                                {chapter.text.map((p, i) => (
                                    <p key={i}>{p}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className={styles.lessonBlock}>
                <div className={styles.lessonLabel}>
                    <span className={styles.dot}>●</span> Lesson carried forward:
                </div>
                <div className={styles.lessonContent}>
                    <div className={styles.lessonQuote} ref={quoteRef as any}>
                        I know what it takes to build a sustainable growth system — combining technical automation without losing the human touch.
                    </div>
                    <button className={styles.ctaButton}>Book your Consultation</button>
                </div>
            </div>
        </section>
    );
}
