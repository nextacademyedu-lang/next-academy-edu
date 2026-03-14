"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import styles from './auth-layout.module.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AnimatedAuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Decide whether the "brand showcase" panel should be on the Left or Right
  // Let's say Login -> brand panel is on right, form is on left
  // Sign up -> brand panel is on left, form is on right
  const isSignUpPage = pathname.includes('register') || pathname.includes('signup');

  return (
    <div className={styles.pageContainer}>
      <div className={styles.layoutWrapper}>
        
        {/* Animated Brand Showcase Panel */}
        <motion.div 
          className={styles.brandPanel}
          animate={{
            x: isSignUpPage ? '0%' : '100%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={styles.brandContent}>
             {/* Testimonial card like Aceternity */}
             <div className={styles.testimonialCard}>
               <div className={styles.badges}>
                 <span className={styles.badge}>Product Company</span>
                 <span className={styles.badge}>Cloud Management</span>
               </div>
               <p className={styles.testimonialQuote}>
                 "Next Academy has completely changed how our team operates. The level of practical knowledge dropped our onboarding time from months down to weeks."
               </p>
               <div className={styles.author}>
                 <p className={styles.authorName}>Gina Clinton</p>
                 <p className={styles.authorRole}>Head of Product, <strong>Acme Inc.</strong></p>
               </div>
             </div>
          </div>
        </motion.div>

        {/* Animated Form Panel Container */}
        <motion.div 
          className={styles.formContainerWrapper}
          animate={{
            x: isSignUpPage ? '100%' : '0%',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={styles.formContent}>
            {children}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
