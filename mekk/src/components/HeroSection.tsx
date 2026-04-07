'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './HeroSection.module.css';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const fgTextRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const elementsToFadeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // ── Initial State ──────────────────────────────
      // جملة STOP هتبدأ في الثلث السفلي
      gsap.set(bgTextRef.current, {
        y: '25vh',
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
      });

      // جملة START هتبدأ مستخبية تحت خالص
      gsap.set(fgTextRef.current, {
        y: '60vh',
        opacity: 0,
        filter: 'blur(20px)',
        scale: 0.9,
      });

      gsap.set(elementsToFadeRef.current, { opacity: 0 });

      // ── Scroll Timeline ────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          pin: stickyRef.current,
          scrub: 1,
        },
      });

      // 1. جملة "STOP": تتزق لفوق (Negative Y)، وتكبر كأنها بتقرب من الكاميرا وتتموه
      tl.to(bgTextRef.current, {
        y: '-15vh', // اتغيرت لـ سالب عشان تطلع لفوق
        filter: 'blur(30px)', // Blur أقوى عشان تدي عمق
        opacity: 0,
        scale: 1.3, // بتكبر وهي بتطلع لفوق
        ease: 'power1.inOut',
      }, 0); // بتبدأ عند اللحظة 0

      // 2. جملة "START": تطلع لفوق تاخد مكانها
      tl.to(fgTextRef.current, {
        y: '15vh',
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        ease: 'power2.out',
      }, 0); // خليناها تبدأ عند اللحظة 0 برضه عشان تبان إنها هي اللي بتزق القديمة

      // 3. إظهار التفاصيل الصغيرة (Subtext)
      tl.to(elementsToFadeRef.current, {
        opacity: 1,
        ease: 'power2.out',
      }, 0.4);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <div ref={stickyRef} className={styles.stickyContainer}>

        {/* Layer 1 — Initial Text (Behind Image) */}
        <div ref={bgTextRef} className={`${styles.textLayer} ${styles.bgLayer}`}>
          <h1 className={styles.massiveTextBg}>STOP PLAYING SMALL</h1>
        </div>

        {/* Layer 2 — Portrait (Centered) */}
        <div className={styles.portraitWrapper}>
          <Image
            ref={imageRef}
            src="/images/mekky.png"
            alt="Muhammed Mekky"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={styles.portrait}
          />
        </div>

        {/* Layer 3 — Final Text (Front of Image) */}
        <div ref={fgTextRef} className={`${styles.textLayer} ${styles.fgLayer}`}>
          <div className={styles.fgContent}>
            <h1 className={styles.massiveTextFg}>
              <span>START</span>
              <span>SCALING SMART</span>
            </h1>

            <div ref={elementsToFadeRef}>
              <p className={styles.subText}>
                AI-powered systems & automation architecture<br />
                for businesses ready to stop operating manually<br />
                and start scaling intelligently.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className={styles.scrollHintBox}>
          <div className={styles.scrollLine} />
          <span>scroll</span>
        </div>

      </div>
    </section>
  );
}
