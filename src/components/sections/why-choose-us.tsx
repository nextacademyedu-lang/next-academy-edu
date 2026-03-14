"use client";

import { Target, Lightbulb, Users, Mic } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import styles from './why-choose-us.module.css';

gsap.registerPlugin(ScrollTrigger);

const SERVICES = [
  {
    title: 'Practical Workshops',
    description: 'We offer hands-on workshops that teach you how to immediately apply what you learn in marketing, sales, or management.',
    icon: Target
  },
  {
    title: '1:1 Consultations',
    description: 'If you have a business idea or a project to grow, our expert consultation sessions help you plan smart and scale faster.',
    icon: Lightbulb
  },
  {
    title: 'Entrepreneur Community',
    description: 'Join the Next community, exchange experiences, ideas, and find support from people who share your passion and ambition.',
    icon: Users
  },
  {
    title: 'Live Events & Meetups',
    description: 'We organize camps and live events that combine intense learning with real-world experience and networking.',
    icon: Mic
  }
];

export function WhyChooseUs() {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let ctx = gsap.context(() => {
        const words = gsap.utils.toArray('.word');
        
        // تأثير إظهار النص عند التمرير
        gsap.fromTo(words,
          { 
            opacity: 0.2, // الحالة المبدئية: النص شفاف شوية
            y: 15, // بيبدأ وهو نازل لتحت سنة صغيرة
            color: '#000000' // بيبدأ لونه أسود تماماً عشان يكون مندمج مع الخلفية
          },
          {
            opacity: 1, // الحالة النهائية: النص ظاهر بالكامل
            y: 0, // بيرجع لمكانه الطبيعي
            color: 'var(--text-primary)', // لونه بيرجع أبيض تاني 
            stagger: 0.05, // حركة الكلمات بتظهر واحدة ورا التانية بفرق جزء من الثانية
            ease: 'power2.out', // عشان الحركة تكون ناعمة في نهايتها
            scrollTrigger: {
              trigger: textRef.current, // الأنميشن بيبدأ لما السيكشن ده يبدأ يظهر
              start: 'top 80%', // بيبدأ لما بداية السيكشن توصل لـ 80% من الشاشة
              end: 'bottom 50%', // بينتهي لما نهاية السيكشن توصل لنص الشاشة
              scrub: true, // مهم جداً: ده اللي بيخلي الأنميشن مربوط بحركة الماوس بالظبط
            }
          }
        );
      }, textRef);
      
      return () => ctx.revert(); // Cleanup GSAP context on unmount
    }
  }, []);

  const manifestoText = "We're not just a place that offers courses and workshops... we're a true partner in the journey of every entrepreneur, idea owner, or anyone ambitious who wants to grow and succeed in the business world.";
  const words = manifestoText.split(" ");

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* GSAP Text Reveal Manifesto Section */}
        <div className={styles.manifestoWrapper} ref={textRef}>
          <div className={styles.labelSection}>
            <span className={styles.label}>Your Next Step</span>
          </div>
          <h2 className={styles.manifestoTitle}>
            {words.map((word, index) => (
              <span key={index} className={`word ${styles.word}`}>
                {word}
              </span>
            ))}
          </h2>
          <p className={styles.manifestoSubtitle}>
            We speak to the <strong>NEXT GENERATION</strong> of professionals. We help you take your business to the <strong>NEXT LEVEL</strong>.
          </p>
        </div>

        {/* Framer Motion Fade-up Grid for Services */}
        <motion.div 
          className={styles.grid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
        >
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            
            return (
            <motion.div 
              key={index}
              className={styles.serviceItem}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className={styles.iconWrapper}>
                <Icon size={32} />
              </div>
              <Card className={styles.card}>
                <CardHeader className={styles.cardHeader}>
                  <CardTitle className={styles.cardTitle}>{service.title}</CardTitle>
                </CardHeader>
                <CardContent className={styles.cardContent}>
                  <p className={styles.description}>{service.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          )})}
        </motion.div>
        
      </div>
    </section>
  );
}
