'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SITE } from '@/lib/constants';
import { submitTestimonialInquiry } from '@/app/api/contact/actions';
import styles from './TestimonialsStatement.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

export default function TestimonialsStatement() {
    const sectionRef = useRef<HTMLElement>(null);
    const linesRef = useRef<(HTMLParagraphElement | null)[]>([]);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(linesRef.current, {
                yPercent: 120, skewY: 4, opacity: 0,
                duration: 1.2, ease: 'expo.out', stagger: 0.12,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 75%',
                    toggleActions: 'play reverse play reverse',
                },
            });
            gsap.from(sectionRef.current!.querySelector(`.${styles.emailBlock}`), {
                y: 40, opacity: 0, duration: 1,
                ease: 'power3.out', delay: 0.4,
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play reverse play reverse',
                },
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('email', email);
        await submitTestimonialInquiry(formData);

        setLoading(false);
        setSent(true);
    };

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.textWrapper}>
                <div className={styles.lineWrapper}>
                    <p ref={(el) => { linesRef.current[0] = el; }} className={styles.line}>
                        RESULTS SPEAK
                    </p>
                </div>
                <div className={styles.lineWrapper}>
                    <p ref={(el) => { linesRef.current[1] = el; }} className={`${styles.line} ${styles.bold}`}>
                        LOUDER.
                    </p>
                </div>
            </div>

            <div className={styles.emailBlock}>
                <p className={styles.emailText}>
                    Want results like these? Let&apos;s start with a conversation.
                </p>
                {sent ? (
                    <p className={styles.successMsg}>✦ Got it — I&apos;ll be in touch soon.</p>
                ) : (
                    <form className={styles.emailForm} onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className={styles.emailInput}
                            required
                        />
                        <button type="submit" className={styles.emailBtn} disabled={loading}>
                            {loading ? 'Sending...' : "Let's Talk →"}
                        </button>
                    </form>
                )}
                <a href={`mailto:${SITE.email}`} className={styles.directLink}>
                    or email directly — {SITE.email}
                </a>
            </div>
        </section>
    );
}
