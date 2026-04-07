'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';
import { TESTIMONIALS } from '@/lib/constants'; // اتأكد من المسار ده
import styles from './TestimonialsSection.module.css';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function TestimonialsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const quoteRef = useRef<HTMLParagraphElement>(null);
    const authorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!sectionRef.current || !quoteRef.current) return;

        let split: SplitType;

        const ctx = gsap.context(() => {
            // 1. تكسير النص لكلمات
            split = new SplitType(quoteRef.current!, { types: 'words' });

            // 2. أنيميشن القراءة (Scrubbing) للكلمات
            gsap.fromTo(
                split.words,
                { 
                    color: 'rgba(0, 0, 0, 0.15)', // الكلمات في البداية رمادي فاتح
                }, 
                {
                    color: '#111111', // تتحول لأسود صريح
                    stagger: 0.1,
                    ease: 'none', // none أفضل في الـ Scrub
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 60%', // الأنيميشن يبدأ لما السيكشن يوصل لـ 60% من الشاشة
                        end: 'center center', // يخلص لما السيكشن يوصل للنص
                        scrub: 1, // رقم 1 بيدي نعومة (Smoothness) وتأخير خفيف للسكرول
                    },
                }
            );

            // 3. أنيميشن لاسم العميل عشان ميبقاش ثابت
            if (authorRef.current) {
                gsap.fromTo(authorRef.current,
                    { opacity: 0, x: -20 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: authorRef.current,
                            start: 'top 85%',
                        }
                    }
                );
            }

        }, sectionRef);

        return () => {
            // أهم خطوة: لازم نرجع الـ DOM لأصله عشان React ميزعلش
            if (split) split.revert();
            ctx.revert();
        };
    }, []);

    // لو الـ Array فاضية عشان ميعملش إيرور
    if (!TESTIMONIALS || TESTIMONIALS.length === 0) return null;
    
    const featuredTestimonial = TESTIMONIALS[0];

    return (
        <section ref={sectionRef} className={styles.testimonials}>
            <div className={styles.container}>
                <div className={styles.topMeta}>
                    <span className={styles.sectionLabel}>Client Proof</span>
                </div>

                <div className={styles.quoteWrapper}>
                    <p ref={quoteRef} className={styles.quote}>
                        {featuredTestimonial.quote}
                    </p>
                </div>

                <div ref={authorRef} className={styles.author}>
                    <p className={styles.name}>{featuredTestimonial.author}</p>
                    <p className={styles.role}>{featuredTestimonial.role}</p>
                </div>
            </div>
        </section>
    );
}