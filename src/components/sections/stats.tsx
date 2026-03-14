"use client";

import React, { useEffect, useRef } from 'react';
import { motion, animate, useInView } from 'framer-motion';
import styles from './stats.module.css';

// In reality, this will be fetched from Payload CMS / DB
const MOCK_STATS = [
  { value: 15000, suffix: '+', label: 'Professionals Trained' },
  { value: 500, suffix: '+', label: 'Corporate Partners' },
  { value: 120, suffix: '+', label: 'Expert Instructors' },
  { value: 98, suffix: '%', label: 'Completion Rate' },
];

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
          {MOCK_STATS.map((stat, index) => (
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
