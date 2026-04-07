'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { LECTURES, SITE } from '@/lib/constants';
import Navbar from '@/components/Navbar';
import FooterSection from '@/components/FooterSection';
import styles from './LectureDetail.module.css';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

function ShareButton({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.shareRow}>
            <span className={styles.shareLabel}>Share</span>
            <button onClick={handleCopy} className={styles.shareBtn} title="Copy link">
                {copied ? '✓ Copied!' : '🔗 Copy Link'}
            </button>
            <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
            >
                𝕏 Twitter
            </a>
            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.shareBtn}
            >
                in LinkedIn
            </a>
        </div>
    );
}

export default function LectureDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const lecture = LECTURES.find((l) => l.slug === slug);
    const otherLectures = LECTURES.filter((l) => l.slug !== slug).slice(0, 3);
    const contentRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const topicsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;
        const ctx = gsap.context(() => {
            gsap.from(contentRef.current!.querySelectorAll('[data-reveal]'), {
                y: 40, opacity: 0, duration: 1,
                stagger: 0.1, ease: 'power3.out', delay: 0.3,
            });
            if (sidebarRef.current) {
                gsap.from(sidebarRef.current, {
                    y: 30, opacity: 0, duration: 1,
                    ease: 'power3.out', delay: 0.5,
                });
            }
            if (topicsRef.current) {
                gsap.from(topicsRef.current.children, {
                    x: -30, opacity: 0, duration: 0.8,
                    stagger: 0.08, ease: 'power3.out',
                    scrollTrigger: { trigger: topicsRef.current, start: 'top 85%' },
                });
            }
        }, contentRef);
        return () => ctx.revert();
    }, []);

    if (!lecture) {
        return (
            <>
                <Navbar />
                <div className={styles.notFound}>
                    <h1 className={styles.notFoundTitle}>Lecture Not Found</h1>
                </div>
                <FooterSection />
            </>
        );
    }

    const driveEmbedUrl = `https://drive.google.com/file/d/${lecture.videoId}/preview`;

    return (
        <>
            <Navbar />
            <div className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                {/* Video Hero */}
                <div className={styles.videoHero}>
                    <div className={styles.videoWrapper}>
                        <iframe
                            src={driveEmbedUrl}
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title={lecture.title}
                        />
                    </div>
                </div>

                {/* Main content */}
                <div className={styles.contentLayout} ref={contentRef}>
                    {/* Left column */}
                    <div className={styles.mainColumn}>
                        <a href="/lectures" className={styles.backLink} data-reveal>← Back to Lectures</a>

                        <div className={styles.headerBlock} data-reveal>
                            <span className={styles.workshopBadge}>🎓 Workshop · {lecture.duration}</span>
                            <h1 className={styles.title}>{lecture.title}</h1>
                        </div>

                        {/* Share */}
                        <div data-reveal>
                            <ShareButton title={lecture.title} />
                        </div>

                        {/* About */}
                        <div className={styles.descriptionBlock} data-reveal>
                            <span className={styles.sectionLabel}>About This Workshop</span>
                            <p className={styles.descriptionText}>{lecture.longDescription}</p>
                        </div>

                        {/* Curriculum */}
                        <div className={styles.curriculumBlock} data-reveal>
                            <span className={styles.sectionLabel}>
                                What You&apos;ll Learn · {lecture.topics.length} Topics
                            </span>
                            <div className={styles.topicsList} ref={topicsRef}>
                                {lecture.topics.map((topic, i) => (
                                    <div key={i} className={styles.topicItem}>
                                        <span className={styles.topicNumber}>{String(i + 1).padStart(2, '0')}</span>
                                        <span className={styles.topicIcon}>📋</span>
                                        <span className={styles.topicName}>{topic}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quote block */}
                        <blockquote className={styles.quoteBlock} data-reveal>
                            <span className={styles.quoteText}>
                                "Every concept in this workshop is something I've tested in the real world first."
                            </span>
                            <footer className={styles.quoteAuthor}>— Muhammed Mekky</footer>
                        </blockquote>
                    </div>

                    {/* Sidebar */}
                    <div className={styles.sidebar} ref={sidebarRef}>
                        <div className={styles.sidebarCard}>
                            <h3 className={styles.sidebarTitle}>Workshop Details</h3>
                            <div className={styles.metaList}>
                                {[
                                    { icon: '⏱️', label: 'Duration', value: lecture.duration },
                                    { icon: '📚', label: 'Topics', value: `${lecture.topics.length} Modules` },
                                    { icon: '🎯', label: 'Level', value: 'All Levels' },
                                    { icon: '🌐', label: 'Language', value: 'Arabic' },
                                    { icon: '👥', label: 'Format', value: 'Live / Online' },
                                ].map((m, i) => (
                                    <div key={i} className={styles.metaRow}>
                                        <span className={styles.metaIcon}>{m.icon}</span>
                                        <span className={styles.metaLabel}>{m.label}</span>
                                        <span className={styles.metaValue}>{m.value}</span>
                                    </div>
                                ))}
                            </div>
                            <a href={`mailto:${SITE.email}`} className={styles.ctaButton}>Book This Workshop →</a>
                            <a
                                href={`https://drive.google.com/file/d/${lecture.videoId}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.ctaButtonOutline}
                            >
                                Watch Full Recording
                            </a>
                            <div className={styles.instructorCard}>
                                <Image src="/images/avatar.png" alt="Muhammed Mekky" width={48} height={48} className={styles.instructorAvatar} />
                                <div className={styles.instructorInfo}>
                                    <span className={styles.instructorName}>Muhammed Mekky</span>
                                    <span className={styles.instructorRole}>Automation Strategist & Trainer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Workshops */}
                {otherLectures.length > 0 && (
                    <section className={styles.otherSection}>
                        <div className={styles.otherInner}>
                            <span className={styles.otherLabel}>● More Workshops</span>
                            <h2 className={styles.otherHeading}>KEEP LEARNING.</h2>
                            <div className={styles.otherGrid}>
                                {otherLectures.map((l) => (
                                    <a key={l.slug} href={`/lectures/${l.slug}`} className={styles.otherCard}>
                                        <div className={styles.otherCardImg}>
                                            <Image src={l.image} alt={l.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                                        </div>
                                        <div className={styles.otherCardContent}>
                                            <span className={styles.otherDuration}>{l.duration}</span>
                                            <h3 className={styles.otherTitle}>{l.title}</h3>
                                            <p className={styles.otherDesc}>{l.description}</p>
                                            <span className={styles.otherLink}>Watch Now →</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <FooterSection />
            </div>
        </>
    );
}
