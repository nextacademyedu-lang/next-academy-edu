'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import styles from './FloatingCTA.module.css';
import Link from 'next/link';

export default function FloatingCTA() {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | 'top'>('top');
    const lastScrollY = useRef(0);
    const ctaRef = useRef<HTMLAnchorElement>(null);
    const topRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 100) {
                setScrollDirection('top');
            } else if (currentScrollY > lastScrollY.current) {
                setScrollDirection('down');
            } else if (currentScrollY < lastScrollY.current) {
                setScrollDirection('up');
            }

            lastScrollY.current = currentScrollY;
            setIsVisible(currentScrollY > 50); // General visibility threshold
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Init

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (scrollDirection === 'top' || scrollDirection === 'down') {
                // Hide Back to Top first
                gsap.to(topRef.current, {
                    y: 20,
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.3,
                    ease: 'power2.in',
                    pointerEvents: 'none'
                });
                // Show Primary CTA with a slight delay for smoothness
                gsap.to(ctaRef.current, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: 0.15,
                    ease: 'back.out(1.2)',
                    pointerEvents: 'auto'
                });
            } else if (scrollDirection === 'up') {
                // Hide Primary CTA first
                gsap.to(ctaRef.current, {
                    y: 20,
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.3,
                    ease: 'power2.in',
                    pointerEvents: 'none'
                });
                // Show Back to Top with a slight delay
                gsap.to(topRef.current, {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: 0.15,
                    ease: 'back.out(1.2)',
                    pointerEvents: 'auto'
                });
            }
        });

        return () => ctx.revert();
    }, [scrollDirection]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.ctaContainer}>
            <Link href="/book" ref={ctaRef} className={styles.primaryBtn}>
                LET&apos;S TALK SYSTEMS
            </Link>

            <button
                ref={topRef}
                className={styles.backToTopBtn}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    );
}
