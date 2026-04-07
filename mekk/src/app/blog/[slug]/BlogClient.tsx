'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import BlogNewsletter from '@/components/blog/BlogNewsletter';
import styles from './BlogPost.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

interface BlogData {
    title: string;
    slug: string;
    excerpt: string;
    image: string;
    content: string[];
    publish_date: string;
}

function ShareRow({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const url = typeof window !== 'undefined' ? window.location.href : '';
    return (
        <div className={styles.shareRow}>
            <span className={styles.shareLabel}>Share</span>
            <button onClick={copy} className={styles.shareBtn}>{copied ? '✓ Copied' : '🔗 Link'}</button>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>𝕏 Twitter</a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn}>in LinkedIn</a>
        </div>
    );
}

export default function BlogClient({ post, related }: { post: BlogData, related: BlogData[] }) {
    const heroRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Reading progress bar + word count
    const wordCount = post.content.join(' ').split(' ').length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    const displayDate = new Date(post.publish_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        if (!heroRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(heroRef.current!.querySelectorAll('[data-reveal]'), {
                y: 60, opacity: 0, duration: 1.2,
                stagger: 0.12, ease: 'expo.out', delay: 0.1,
            });
            if (bodyRef.current) {
                gsap.from(bodyRef.current.children, {
                    y: 40, opacity: 0, duration: 1,
                    stagger: 0.15, ease: 'power3.out',
                    scrollTrigger: { trigger: bodyRef.current, start: 'top 80%' },
                });
            }
        }, heroRef);

        // Reading progress
        const onScroll = () => {
            if (!progressRef.current) return;
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.scrollY / total) * 100;
            progressRef.current.style.width = `${progress}%`;
        };
        window.addEventListener('scroll', onScroll);
        return () => {
            ctx.revert();
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    return (
        <>
            {/* Reading progress bar */}
            <div className={styles.progressBar} ref={progressRef} />
            <Navbar />

            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                {/* Hero */}
                <section ref={heroRef} className={styles.hero}>
                    <div className={styles.heroImageWrapper}>
                        <Image src={post.image} alt={post.title} fill sizes="100vw" className={styles.heroImage} priority />
                        <div className={styles.heroOverlay} />
                    </div>
                    <div className={styles.heroContent}>
                        <a href="/blog" className={styles.backLink} data-reveal>← Back to Blog</a>
                        <div className={styles.heroMeta} data-reveal>
                            <span className={styles.date}>{displayDate}</span>
                            <span className={styles.readTime}>· {readTime} min read</span>
                        </div>
                        <h1 className={styles.title} data-reveal>{post.title}</h1>
                        <ShareRow title={post.title} />
                    </div>
                </section>

                {/* Article body */}
                <div className={styles.articleLayout}>
                    <div className={styles.articleBody} ref={bodyRef}>
                        {post.content.map((paragraph, i) => (
                            <p key={i} className={styles.paragraph}>{paragraph}</p>
                        ))}

                        {/* Bottom share */}
                        <div className={styles.bottomShare}>
                            <p className={styles.bottomShareText}>Found this useful? Share it.</p>
                            <ShareRow title={post.title} />
                        </div>
                    </div>

                    {/* Sidebar TOC */}
                    <aside className={styles.tocSidebar}>
                        <div className={styles.tocCard}>
                            <span className={styles.tocLabel}>In This Article</span>
                            <ul className={styles.tocList}>
                                {post.content.map((_, i) => (
                                    <li key={i} className={styles.tocItem}>
                                        <span className={styles.tocNum}>{String(i + 1).padStart(2, '0')}</span>
                                        <span className={styles.tocText}>Section {i + 1}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.readTimeBadge}>
                                🕐 {readTime} min read
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Related posts */}
                {related.length > 0 && (
                    <section className={styles.relatedSection}>
                        <span className={styles.relatedLabel}>● More Articles</span>
                        <h2 className={styles.relatedHeading}>KEEP READING.</h2>
                        <div className={styles.relatedGrid}>
                            {related.map((r) => {
                                const rDate = new Date(r.publish_date).toLocaleDateString();
                                return (
                                    <a key={r.slug} href={`/blog/${r.slug}`} className={styles.relatedCard}>
                                        <div className={styles.relatedImg}>
                                            <Image src={r.image} alt={r.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                                        </div>
                                        <div className={styles.relatedInfo}>
                                            <span className={styles.relatedDate}>{rDate}</span>
                                            <h3 className={styles.relatedTitle}>{r.title}</h3>
                                            <p className={styles.relatedExcerpt}>{r.excerpt}</p>
                                            <span className={styles.relatedLink}>Read Article →</span>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                )}

                <BlogNewsletter />
                <FooterSection />
            </div>
        </>
    );
}
