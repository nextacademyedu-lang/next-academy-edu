import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import styles from './MockupSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

interface MockupSectionProps {
    desktopSrc: string;
    mobileSrc: string;
    liveUrl?: string;
}

export default function MockupSection({ desktopSrc, mobileSrc, liveUrl }: MockupSectionProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const desktopRef = useRef<HTMLDivElement>(null);
    const mobileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !desktopRef.current || !mobileRef.current) return;

        const ctx = gsap.context(() => {
            // Parallax overlapping reveal
            gsap.from(desktopRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            });

            gsap.from(mobileRef.current, {
                y: 150,
                x: 50,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
                delay: 0.3,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                }
            });

            // Gentle floating effect for mobile device
            gsap.to(mobileRef.current, {
                y: "-=15",
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut"
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className={styles.section} ref={sectionRef}>
            <div className={styles.container}>

                {/* Desktop MacBook Frame */}
                <div className={styles.macbookWrapper} ref={desktopRef}>
                    <div className={styles.macbookScreen}>
                        <div className={styles.camera} />
                        <div className={styles.imageContainer}>
                            <Image src={desktopSrc} alt="Desktop Preview" className={styles.screenshot} fill sizes="(max-width: 1024px) 100vw, 1024px" />
                        </div>
                    </div>
                    <div className={styles.macbookBase}>
                        <div className={styles.macbookThumb} />
                    </div>
                </div>

                {/* Mobile iPhone Frame */}
                <div className={styles.iphoneWrapper} ref={mobileRef}>
                    <div className={styles.notch} />
                    <div className={styles.imageContainerMobile}>
                        <Image src={mobileSrc} alt="Mobile Preview" className={styles.screenshotMobile} fill sizes="(max-width: 768px) 100vw, 300px" />
                    </div>
                </div>

            </div>
            {liveUrl && (
                <div className={styles.actionContainer}>
                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" className={styles.liveButton}>
                        Visit Live Project ↗
                    </a>
                </div>
            )}
        </div>
    );
}
