'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Reveal from '@/components/ui/Reveal';
import styles from './BlogGrid.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

interface BlogData {
    title: string;
    slug: string;
    excerpt: string;
    image: string;
    publish_date?: string;
    date?: string;
}

export default function BlogGrid({ items = [] }: { items?: BlogData[] }) {
    const gridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!gridRef.current) return;
        const ctx = gsap.context(() => {
            const cards = gridRef.current!.querySelectorAll(`.${styles.card}`);

            cards.forEach((card) => {
                const img = card.querySelector(`.${styles.imageBox} img`);
                if (img) {
                    gsap.to(img, {
                        yPercent: 10,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: card,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        }
                    });
                }
            });
        }, gridRef);
        return () => ctx.revert();
    }, []);

    if (items.length === 0) {
        return (
            <section className={styles.section}>
                <div className={styles.container}>
                    <p style={{ color: 'var(--text-secondary)' }}>No articles published yet.</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.topRow}>
                    <span className={styles.label}>● Recent Insights</span>
                    <p className={styles.meta}>Total {items.length} articles</p>
                </div>

                {/* Featured Post - First Item */}
                {items[0] && (
                    <div className={styles.featured}>
                        <Reveal delay={0.2}>
                            <a href={`/blog/${items[0].slug}`} className={styles.featuredCard}>
                                <div className={styles.featuredImgWrapper}>
                                    <Image src={items[0].image} alt={items[0].title} fill sizes="(max-width: 768px) 100vw, 50vw" priority />
                                </div>
                                <div className={styles.featuredContent}>
                                    <span className={styles.fLabel}>⭐ Featured Post</span>
                                    <h2 className={styles.fTitle}>{items[0].title}</h2>
                                    <p className={styles.fExcerpt}>{items[0].excerpt}</p>
                                    <span className={styles.fLink}>Read Article →</span>
                                </div>
                            </a>
                        </Reveal>
                    </div>
                )}

                {/* Grid - Rest of Items */}
                <div ref={gridRef} className={styles.grid}>
                    {items.slice(1).map((post, i) => {
                        const displayDate = post.publish_date ? new Date(post.publish_date).toLocaleDateString() : post.date;
                        return (
                            <Reveal key={post.slug} delay={i * 0.1}>
                                <a href={`/blog/${post.slug}`} className={styles.card}>
                                    <div className={styles.imageBox}>
                                        <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                                        <span className={styles.dateBadge}>{displayDate}</span>
                                    </div>
                                    <div className={styles.info}>
                                        <h3 className={styles.cardTitle}>{post.title}</h3>
                                        <p className={styles.excerpt}>{post.excerpt}</p>
                                        <span className={styles.cardLink}>Read More +</span>
                                    </div>
                                </a>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
