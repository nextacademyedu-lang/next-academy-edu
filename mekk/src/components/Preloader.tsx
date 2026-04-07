'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.css';

export default function Preloader() {
    const [done, setDone] = useState(false);
    const preloaderRef = useRef<HTMLDivElement>(null);
    const counterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!counterRef.current || !preloaderRef.current) return;

        const counter = { value: 0 };

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.to(preloaderRef.current, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        setDone(true);
                        document.body.style.overflow = '';
                    },
                });
            },
        });

        document.body.style.overflow = 'hidden';

        tl.to(counter, {
            value: 100,
            duration: 2.2,
            ease: 'power2.inOut',
            onUpdate: () => {
                if (counterRef.current) {
                    counterRef.current.textContent = Math.round(counter.value).toString();
                }
            },
        });

        return () => {
            tl.kill();
            document.body.style.overflow = '';
        };
    }, []);

    if (done) return null;

    return (
        <div ref={preloaderRef} className={styles.preloader}>
            <div className={styles.counter}>
                <span ref={counterRef} className={styles.number}>0</span>
                <span className={styles.percent}>%</span>
            </div>
        </div>
    );
}
