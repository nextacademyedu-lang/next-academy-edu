'use client';

import { useEffect, useRef, useState } from 'react';
import { submitContactForm } from '../api/contact/actions';
import styles from './ContactPage.module.css';
import gsap from 'gsap';
import { SITE, SOCIAL_LINKS } from '@/lib/constants';

export default function ContactPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const formRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Headline animation
            const chars = headlineRef.current?.querySelectorAll(`.${styles.char}`);
            if (chars) {
                tl.from(chars, {
                    y: 100,
                    opacity: 0,
                    rotateX: -45,
                    duration: 1,
                    stagger: 0.02,
                    ease: "power4.out"
                });
            }

            // Info & Form appearance
            tl.from([infoRef.current, formRef.current], {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out"
            }, "-=0.5");
        });

        return () => ctx.revert();
    }, []);

    const splitText = (text: string) => {
        return text.split('').map((char, i) => (
            <span key={i} className={styles.char}>
                {char === ' ' ? '\u00A0' : char}
            </span>
        ));
    };

    async function clientAction(formData: FormData) {
        setStatus("loading");
        const res = await submitContactForm(formData);
        if (res?.error) {
            setStatus("error");
            setErrorMsg(res.error);
            return;
        }
        setStatus("success");
    }

    return (
        <main className={styles.page}>
            <section className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.headerArea}>
                        <h1 ref={headlineRef} className={styles.headline}>
                            <span className={styles.lineWrapper}>
                                {splitText("SEND ME A")}
                            </span>
                            <span className={`${styles.lineWrapper} ${styles.highlight}`}>
                                {splitText("MESSAGE")}
                            </span>
                        </h1>
                    </div>

                    <div className={styles.contentWrapper}>
                        {/* Info Side */}
                        <div ref={infoRef} className={styles.infoSide}>
                            <div className={styles.infoBlock}>
                                <span className={styles.label}>Direct Contact</span>
                                <a href={`mailto:${SITE.email}`} className={styles.contactLink}>
                                    {SITE.email}
                                </a>
                                <a href="https://wa.me/201016629910" className={styles.contactLink}>
                                    WhatsApp Direct
                                </a>
                            </div>

                            <div className={styles.infoBlock}>
                                <span className={styles.label}>Socials</span>
                                <div className={styles.socialList}>
                                    {SOCIAL_LINKS.map(link => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.socialItem}
                                        >
                                            {link.label} <span>→</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div ref={formRef} className={styles.formSide}>
                            {status === "success" ? (
                                <div className={styles.successOverlay}>
                                    <h2 className={styles.successTitle}>MESSAGE RECEIVED</h2>
                                    <p className={styles.successText}>
                                        Thanks for reaching out. I'll get back to you personally within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form action={clientAction} className={styles.form}>
                                    <div className={styles.inputGroup}>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your Name"
                                            required
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Your Email"
                                            required
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <textarea
                                            name="message"
                                            placeholder="Tell me about your project..."
                                            rows={5}
                                            required
                                            className={styles.textarea}
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className={styles.submitBtn}
                                    >
                                        {status === "loading" ? "SENDING..." : "SEND MESSAGE"}
                                    </button>

                                    {status === "error" && <p className={styles.errorText}>{errorMsg}</p>}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
