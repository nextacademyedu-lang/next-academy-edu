'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ImpactTransitionSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface ImpactTransitionSectionProps {
    blurredPart: string;
    sharpPart: string;
    questions: string[];
    topLabel?: string;
    bottomNote?: string;
    id?: string;
}

export default function ImpactTransitionSection({
    blurredPart,
    sharpPart,
    questions,
    topLabel = "The 1% Test",
    bottomNote = "If \"yes\" - this work was built for you.",
    id = "impact-section"
}: ImpactTransitionSectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const blurLetterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const sharpRef = useRef<HTMLSpanElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const glowRef = useRef<HTMLDivElement>(null);
    const bottomNoteRef = useRef<HTMLDivElement>(null);

    const blurLetters = blurredPart.split('');

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=350%", // Longer engagement
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1, // Fixes white jumps on some browsers
                    onEnter: () => {
                        // IMMERSIVE MODE: Fade out Navbar and FloatingCTA
                        gsap.to(['.nav', '[class*="ctaContainer"]'], {
                            autoAlpha: 0,
                            duration: 0.5,
                            overwrite: 'auto'
                        });
                    },
                    onLeave: () => {
                        // Restore global elements when leaving
                        gsap.to(['.nav', '[class*="ctaContainer"]'], {
                            autoAlpha: 1,
                            duration: 0.5,
                            overwrite: 'auto'
                        });
                    },
                    onEnterBack: () => {
                        gsap.to(['.nav', '[class*="ctaContainer"]'], {
                            autoAlpha: 0,
                            duration: 0.5,
                            overwrite: 'auto'
                        });
                    },
                    onLeaveBack: () => {
                        gsap.to(['.nav', '[class*="ctaContainer"]'], {
                            autoAlpha: 1,
                            duration: 0.5,
                            overwrite: 'auto'
                        });
                    },
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const totalQuestions = questions.length;

                        // Teleprompter indexing logic - tighter mapping
                        const scrollProgress = Math.max(0, (progress - 0.15) / 0.85);
                        const activeIndex = Math.min(
                            Math.floor(scrollProgress * (totalQuestions + 0.5)),
                            totalQuestions - 1
                        );

                        questionRefs.current.forEach((ref, idx) => {
                            if (!ref) return;
                            const isActive = idx === activeIndex && scrollProgress > 0;
                            const isPast = idx < activeIndex;

                            gsap.to(ref, {
                                opacity: isActive ? 1 : (isPast ? 0.05 : 0.1),
                                scale: isActive ? 1.1 : 0.85,
                                filter: isActive ? "blur(0px)" : (isPast ? "blur(4px)" : "blur(2px)"),
                                y: isActive ? 0 : (isPast ? -10 : 10),
                                duration: 0.5,
                                overwrite: "auto"
                            });
                        });

                        // Show bottom note only at the very end
                        if (bottomNoteRef.current) {
                            gsap.to(bottomNoteRef.current, {
                                opacity: progress > 0.95 ? 1 : 0,
                                y: progress > 0.95 ? 0 : 20,
                                duration: 0.3,
                                overwrite: "auto"
                            });
                        }
                    }
                }
            });

            // 1. STAGGERED BLUR
            blurLetterRefs.current.forEach((letter, i) => {
                tl.to(letter, {
                    filter: "blur(12px)",
                    opacity: 0.8,
                    duration: 1,
                }, i * 0.08);
            });

            // 2. SHARP PART - PURE WHITE (STRICTLY NO SCALE)
            tl.to(sharpRef.current, {
                color: "#ffffff",
                letterSpacing: "0.1em",
                duration: 1.5,
            }, 0.2);

            // 3. TELEPROMPTER SCROLLING (90px per item)
            tl.to(listRef.current, {
                y: -(Math.max(0, questions.length - 1) * 90),
                ease: "none",
                duration: 2.8
            }, 0.4);

            // 4. ACTIVE GLOW PULSE
            if (glowRef.current) {
                gsap.to(glowRef.current, {
                    opacity: 0.7,
                    scale: 1.3,
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            }

        }, containerRef);

        return () => ctx.revert();
    }, [questions, blurLetters.length]);

    return (
        <section ref={containerRef} className={styles.wrapper} id={id}>
            <div className={styles.pinContent}>

                {/* BIG WORD */}
                <div className={styles.wordWrapper}>
                    {blurLetters.map((l, i) => (
                        <span
                            key={i}
                            ref={el => { blurLetterRefs.current[i] = el; }}
                            className={styles.blurLetter}
                        >
                            {l === ' ' ? '\u00A0' : l}
                        </span>
                    ))}
                    <span ref={sharpRef} className={styles.sharpPart}>{sharpPart}</span>
                </div>

                <div className={styles.topLabel}>{topLabel}</div>

                {/* TELEPROMPTER */}
                <div className={styles.teleprompter}>
                    <div ref={glowRef} className={styles.spotlightGlow} />
                    <div className={styles.maskTop} />
                    <div className={styles.maskBottom} />

                    <div ref={listRef} className={styles.list}>
                        {questions.map((q, i) => (
                            <div
                                key={i}
                                ref={el => { questionRefs.current[i] = el; }}
                                className={styles.question}
                            >
                                {q}
                            </div>
                        ))}
                    </div>
                </div>

                {bottomNote && (
                    <div ref={bottomNoteRef} className={styles.bottomNote}>
                        {bottomNote}
                    </div>
                )}

            </div>
        </section>
    );
}
