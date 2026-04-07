'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE, SOCIAL_LINKS } from '@/lib/constants';
import { submitNewsletter } from '@/app/api/contact/actions';
import styles from './FooterSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function FooterSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const middleRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState<string>('');
    const [newsStatus, setNewsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    useEffect(() => {
        const updateTime = () => {
            const cairoTime = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Africa/Cairo',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            }).format(new Date());
            setCurrentTime(`CAIRO ${cairoTime}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!sectionRef.current) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                }
            });

            // Split text animation for headline
            if (headlineRef.current) {
                const chars = headlineRef.current.querySelectorAll('.char');
                tl.from(chars, {
                    y: 80,
                    opacity: 0,
                    rotateX: -90,
                    duration: 1,
                    stagger: 0.03,
                    ease: 'power4.out',
                    transformOrigin: '0% 50% -50'
                });
            }

            tl.from(middleRef.current, {
                y: 40,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            }, "-=0.6");

            // Frame Reveal Animation
            tl.fromTo(frameRef.current, {
                y: 60,
                opacity: 0,
                scale: 0.95
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: 'expo.out',
            }, "-=0.8");

            // Frame internals
            if (frameRef.current) {
                const internals = frameRef.current.querySelectorAll('.frame-item');
                tl.from(internals, {
                    y: 20,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'power3.out'
                }, "-=0.8");
            }

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Helper to split text into spans
    const splitText = (text: string) => {
        return text.split('').map((char, i) => (
            <span key={i} className={`char ${styles.char}`}>
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    return (
        <footer ref={sectionRef} id="contact" className={styles.footer}>
            <div className={styles.topSection}>
                <h2 ref={headlineRef} className={styles.headline}>
                    <span className={styles.lineWrapper}>{splitText("LET'S BUILD")}</span>
                    <br />
                    <span className={styles.lineWrapper}>{splitText("THE NEXT SYSTEM.")}</span>
                </h2>
            </div>

            <div ref={middleRef} className={styles.middleSection}>
                <div className={styles.contactBlock}>
                    <span className={styles.label}>Start a project</span>
                    <a href={`mailto:${SITE.email}`} className={styles.email}>
                        {SITE.email}
                    </a>
                </div>

                <div className={styles.newsletterBlock}>
                    <span className={styles.label}>The Newsletter</span>
                    <form
                        action={async (formData) => {
                            setNewsStatus("loading");
                            const res = await submitNewsletter(formData, 'footer');
                            if (res?.error) setNewsStatus("error");
                            else setNewsStatus("success");
                        }}
                        className={styles.newsletterForm}
                    >
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            required
                            className={styles.newsInput}
                            disabled={newsStatus === "success"}
                        />
                        <button
                            type="submit"
                            className={styles.newsSubmit}
                            disabled={newsStatus === "loading" || newsStatus === "success"}
                        >
                            {newsStatus === "loading" ? "..." : newsStatus === "success" ? "✓" : "→"}
                        </button>
                    </form>
                    {newsStatus === "success" && <p className={styles.successMsg}>You're in the loop.</p>}
                </div>
            </div>

            <div ref={frameRef} className={styles.socialFrame}>
                <p className={`${styles.copyright} frame-item`}>
                    © {new Date().getFullYear()} MUHAMMED MEKKY
                </p>

                <ul className={`${styles.socialList} frame-item`}>
                    {SOCIAL_LINKS.map(link => (
                        <li key={link.label}>
                            <a href={link.href} target="_blank" rel="noreferrer" className={styles.socialLink}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <p className={`${styles.time} frame-item`}>
                    {currentTime || 'CAIRO TIME'}
                </p>
            </div>
        </footer>
    );
}
