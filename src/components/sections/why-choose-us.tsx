"use client";

import { Target, Lightbulb, Users, Mic } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import styles from './why-choose-us.module.css';

gsap.registerPlugin(ScrollTrigger);

const SERVICE_ICONS = [Target, Lightbulb, Users, Mic];

export function WhyChooseUs() {
  const t = useTranslations('WhyChooseUs');
  const textRef = useRef<HTMLDivElement>(null);

  const services = [
    { title: t('service1Title'), description: t('service1Desc'), icon: SERVICE_ICONS[0] },
    { title: t('service2Title'), description: t('service2Desc'), icon: SERVICE_ICONS[1] },
    { title: t('service3Title'), description: t('service3Desc'), icon: SERVICE_ICONS[2] },
    { title: t('service4Title'), description: t('service4Desc'), icon: SERVICE_ICONS[3] },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      let ctx = gsap.context(() => {
        const words = gsap.utils.toArray('.word');
        
        gsap.fromTo(words,
          { 
            opacity: 0.2,
            y: 15,
            color: '#000000'
          },
          {
            opacity: 1,
            y: 0,
            color: 'var(--text-primary)',
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 80%',
              end: 'bottom 50%',
              scrub: true,
            }
          }
        );
      }, textRef);
      
      return () => ctx.revert();
    }
  }, []);

  const manifestoText = t('manifesto');
  const words = manifestoText.split(" ");

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* GSAP Text Reveal Manifesto Section */}
        <div className={styles.manifestoWrapper} ref={textRef}>
          <div className={styles.labelSection}>
            <span className={styles.label}>{t('label')}</span>
          </div>
          <h2 className={styles.manifestoTitle}>
            {words.map((word, index) => (
              <span key={index} className={`word ${styles.word}`}>
                {word}
              </span>
            ))}
          </h2>
          <p className={styles.manifestoSubtitle} dangerouslySetInnerHTML={{ __html: t('subtitle') }} />
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
          {services.map((service, index) => {
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
