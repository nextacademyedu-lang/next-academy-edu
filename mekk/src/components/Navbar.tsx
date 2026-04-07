'use client';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';
import styles from './Navbar.module.css';


export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Refs للـ GSAP
    const overlayRef = useRef<HTMLDivElement>(null);
    const menuTitleRef = useRef<HTMLHeadingElement>(null);
    const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
    const timeline = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            const headerOffset = 50; // Distance from top to check

            // Getting elements at the specific point where the header is
            // We select an element slightly below the top to ensure we are inside the section
            const elementsAtPoint = document.elementsFromPoint(window.innerWidth / 2, headerOffset);

            let isLightUnderneath = false;

            for (const el of elementsAtPoint) {
                // Skip navbar itself and its overlay
                if (el.closest('#main-nav') || el.closest(`.${styles.overlay}`)) continue;

                // Find nearest section or main block
                const bg = window.getComputedStyle(el).backgroundColor;
                // Exclude transparent and rgba transparent
                if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                    const rgb = bg.match(/\d+/g);
                    if (rgb && rgb.length >= 3) {
                        const r = parseInt(rgb[0]);
                        const g = parseInt(rgb[1]);
                        const b = parseInt(rgb[2]);

                        // Perceived brightness formula
                        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        if (brightness > 128) {
                            isLightUnderneath = true;
                        }
                        break; // Stop at the first non-transparent background element
                    }
                }
            }

            const navElement = document.getElementById('main-nav');
            if (navElement) {
                if (isLightUnderneath) {
                    navElement.classList.add(styles.lightMode);
                } else {
                    navElement.classList.remove(styles.lightMode);
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        // Initial call
        setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // Animation overlay changes ...
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.set(overlayRef.current, {
                clipPath: 'inset(0% 0% 100% 0%)',
                visibility: 'hidden'
            });

            gsap.set(menuTitleRef.current, { yPercent: 120, skewY: 5, opacity: 0 });
            gsap.set(linksRef.current, { yPercent: 120, skewY: 5, opacity: 0 });

            timeline.current = gsap.timeline({ paused: true })
                .to(overlayRef.current, {
                    clipPath: 'inset(0% 0% 0% 0%)',
                    visibility: 'visible',
                    duration: 1.2,
                    ease: 'expo.inOut',
                })
                .to(menuTitleRef.current, {
                    yPercent: 0,
                    skewY: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power4.out',
                }, "-=0.6")
                .to(linksRef.current, {
                    yPercent: 0,
                    skewY: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power4.out',
                    stagger: 0.1,
                }, "-=0.7");
        });

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            timeline.current?.play();
            // Force nav to white mode when menu is open because overlay is dark
            document.getElementById('main-nav')?.classList.remove(styles.lightMode);
        } else {
            timeline.current?.reverse();
            // It will naturally recalculate on next scroll, but let's trigger it
            window.dispatchEvent(new Event('scroll'));
        }
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* ── Navbar ── */}
            <nav id="main-nav" className={`${styles.nav} ${isMenuOpen ? styles.menuIsOpenOverride : ''}`}>
                <div className={styles.navBackground}></div>
                <div className={styles.left}>
                    <span className={styles.label}>
                        Marketing Automation Strategist<br />FOR AMBITIOUS TEAMS
                    </span>
                </div>

                <div className={styles.center}>
                    <Link href="/" className={styles.logo}>MUHAMMED MEKKY</Link>
                </div>

                <div className={styles.right}>
                    <Link href="/about" className={styles.link}>About</Link>
                    <Link href="/portfolio" className={styles.link}>Portfolio</Link>

                    {/* زرار الـ Menu */}
                    <button
                        className={`${styles.menuBtn} ${isMenuOpen ? styles.menuOpen : ''}`}
                        onClick={toggleMenu}
                        aria-label="Toggle Menu"
                    >
                        <div className={styles.linesContainer}>
                            <div className={styles.line1}></div>
                            <div className={styles.line2}></div>
                        </div>
                    </button>
                </div>
            </nav>

            {/* ── Fullscreen Menu Overlay ── */}
            <div
                ref={overlayRef}
                className={`${styles.overlay} ${isMenuOpen ? styles.isOpen : ''}`}
            >
                <div className={styles.overlayContent}>
                    {/* العمود الأيسر: كلمة MENU */}
                    <div>
                        <div className={styles.linkItem}>
                            <h2 ref={menuTitleRef} className={styles.menuTitle}>MENU</h2>
                        </div>
                    </div>

                    {/* العمود الأيمن: اللينكات */}
                    <div className={styles.menuLinks}>
                        <div className={styles.navLinksList}>
                            {NAV_LINKS.filter(link => !['Consultation', 'Email Me', 'WhatsApp'].includes(link.label)).map((item, index) => (
                                <div key={item.label} className={styles.linkItem}>
                                    <Link
                                        href={item.href}
                                        className={styles.hugeLink}
                                        ref={(el) => {
                                            linksRef.current[index] = el;
                                        }}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                </div>
                            ))}
                        </div>

                        <div className={styles.menuActions}>
                            {NAV_LINKS.filter(link => ['Consultation', 'Email Me', 'WhatsApp'].includes(link.label)).map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={styles.menuActionButton}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
