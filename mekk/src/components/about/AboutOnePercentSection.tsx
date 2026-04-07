'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSplitText } from '@/hooks/useSplitText';
import styles from './AboutOnePercentSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const PARAGRAPHS = [
    [
        "For years, I was in the trenches of digital marketing, content creation, and community building.",
        "I saw firsthand how agencies and startups operate: constantly pushing for growth, managing complex campaigns, and striving for engagement.",
        "But as the metrics scaled, so did the chaos."
    ],
    [
        "I realized that relying solely on sheer human effort and manual processes creates an unavoidable bottleneck.",
        "Teams were burning out trying to maintain momentum.",
        "That was the moment everything clicked.",
        "We didn't just need more hands on deck; we needed profoundly smarter systems."
    ],
    [
        "I pivoted entirely.",
        "I dove deep into process automation, API integrations, Next.js, and low-code infrastructures.",
        "I transitioned from merely executing marketing strategies to architecting the very \"brain\" of SaaS applications and complex internal workflows."
    ],
    [
        "Whether I'm co-founding an agency like Green Studio 9, leading tech training for government initiatives, or operating as a Senior Automation Specialist & Product Architect at ValueIMS, my mission has shifted.",
        "It is no longer just about generating immediate results—it is about structural integrity."
    ]
];

export default function AboutOnePercentSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const percentRef = useRef<HTMLDivElement>(null);
    const { ref: revealRef, splitRef: revealSplit } = useSplitText(['words']);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            // Count up to 100%
            if (percentRef.current) {
                const countObj = { val: 1 };
                gsap.to(countObj, {
                    val: 100,
                    roundProps: 'val',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: true,
                    },
                    onUpdate: () => {
                        if (percentRef.current) {
                            percentRef.current.innerText = `${countObj.val}%`;
                        }
                    }
                });
            }

            // Animate each sentence as it scrolls into view (fade in)
            const sentences = gsap.utils.toArray('.sentence-reveal');
            sentences.forEach((sentence: any) => {
                gsap.fromTo(sentence,
                    { opacity: 0.15 }, /* Starts at faint opacity */
                    {
                        opacity: 1, /* Solid color when active */
                        ease: 'power1.out',
                        scrollTrigger: {
                            trigger: sentence,
                            start: 'top 85%',
                            end: 'top 50%',
                            scrub: 1,
                        }
                    }
                );
            });

            // Scrub text reveal for the final paragraph
            if (revealSplit.current?.words) {
                gsap.to(revealSplit.current.words, {
                    color: 'rgba(5,5,5,1)', // Transition from faint to solid dark
                    stagger: 0.1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: revealRef.current,
                        start: 'top 80%', // start when paragraph is somewhat in view
                        end: 'bottom 60%', // finish before it leaves
                        scrub: 1,
                    }
                });
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [revealSplit]);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.container}>

                <div className={styles.leftColumn}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.number}>(04)</span>
                        <h2 className={styles.title}>THE MOMENT IT<br />CLICKED</h2>
                    </div>

                    <div className={styles.onePercentWrapper}>
                        <div className={styles.become}>BECOME</div>
                        <div className={styles.onePercentText} ref={percentRef}>1%</div>
                        <div className={styles.better}>BETTER EVERY DAY.</div>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.rightHeader}>
                        The pivot from hustle to architecture
                    </div>

                    <div className={styles.paragraphs}>
                        {PARAGRAPHS.map((sentences, pIndex) => (
                            <p key={pIndex}>
                                {sentences.map((sentence, sIndex) => (
                                    <span key={sIndex} className={`sentence-reveal ${styles.sentenceItem}`}>
                                        {sentence}{" "}
                                    </span>
                                ))}
                            </p>
                        ))}
                    </div>

                    <div className={styles.largeReveal} ref={revealRef as any}>
                        If you're ready to reinvent, rebuild, or simply optimize what's already working, let's begin the conversation.
                    </div>
                </div>

            </div>
        </section>
    );
}
