'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { submitNewsletter } from '@/app/api/contact/actions';
import styles from './CaseStudiesNewsletter.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function CaseStudiesNewsletter() {
    const sectionRef = useRef<HTMLElement>(null);
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(sectionRef.current!.querySelector(`.${styles.box}`), {
                y: 60, opacity: 0, duration: 1.4,
                ease: 'expo.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        await submitNewsletter(formData, 'case_studies');

        setLoading(false);
        setSent(true);
    };

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.box}>
                <div className={styles.content}>
                    <h2 className={styles.title}>BEHIND THE SCENES.</h2>
                    <p className={styles.desc}>
                        Get deep dives and teardowns of real businesses applying these marketing automation systems.
                    </p>
                </div>
                {sent ? (
                    <div className={styles.success}>✦ We'll be in touch.</div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <input type="email" name="email" placeholder="email@example.com" className={styles.input} required />
                        <button type="submit" className={styles.btn} disabled={loading}>
                            {loading ? 'Joining...' : 'Get Updates →'}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
