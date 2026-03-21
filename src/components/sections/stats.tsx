"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import styles from './stats.module.css';

type StatsPayload = {
  professionals: number;
  partners: number;
  instructors: number;
  completionRate: number;
};

function AnimatedCounter({ from, to, suffix }: { from: number, to: number, suffix: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = Math.floor(value).toLocaleString() + suffix;
      },
    });

    return () => controls.stop();
  }, [from, to, suffix, isInView]);

  return <span ref={nodeRef} className={styles.value} />;
}

export function StatsSection() {
  const t = useTranslations('Stats');
  const [stats, setStats] = useState<StatsPayload>({
    professionals: 0,
    partners: 0,
    instructors: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/home/stats', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data?.stats) return;
        setStats({
          professionals: Number(data.stats.professionals || 0),
          partners: Number(data.stats.partners || 0),
          instructors: Number(data.stats.instructors || 0),
          completionRate: Number(data.stats.completionRate || 0),
        });
      } catch {
        // keep safe defaults
      }
    };

    fetchStats();
  }, []);

  const cards = useMemo(
    () => [
      { value: stats.professionals, suffix: '+', label: t('professionals') },
      { value: stats.partners, suffix: '+', label: t('partners') },
      { value: stats.instructors, suffix: '+', label: t('instructors') },
      { value: Math.max(0, Math.min(100, stats.completionRate)), suffix: '%', label: t('completion') },
    ],
    [stats, t],
  );

  return (
    <section className={styles.section}>
      <div className={styles.container}>
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
          {cards.map((stat, index) => (
            <motion.div 
              key={index} 
              className={styles.statBlock}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
              }}
            >
              <AnimatedCounter from={0} to={stat.value} suffix={stat.suffix} />
              <span className={styles.label}>{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
