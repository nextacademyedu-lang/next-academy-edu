'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import styles from './text-testimonials.module.css';

type Testimonial = {
  text: string;
  name: string;
  avatar: string;
  rating: number;
};

export function TextTestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/home/testimonials');
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data?.testimonials) ? data.testimonials as Testimonial[] : [];
        setTestimonials(docs);
      } catch {
        // Keep component resilient
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading) return null;
  if (testimonials.length === 0) return null;

  const marqueeRow1 = [...testimonials, ...testimonials];
  const marqueeRow2 = [...testimonials.slice(2), ...testimonials.slice(0, 2), ...testimonials.slice(2), ...testimonials.slice(0, 2)];

  return (
    <section className={styles.section}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeRow} style={{ animationDirection: 'normal' }}>
          <div className={styles.marqueeContent}>
            {marqueeRow1.map((item, idx) => (
              <Card key={`r1-${idx}`} className={styles.reviewCard}>
                <CardContent className={styles.reviewContent}>
                  <p className={styles.reviewText}>{item.text}</p>
                  <div className={styles.reviewer}>
                    <div className={styles.avatar}>{item.avatar}</div>
                    <div className={styles.reviewerInfo}>
                      <h4 className={styles.reviewerName}>{item.name}</h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className={styles.marqueeRow} style={{ animationDirection: 'reverse' }}>
          <div className={styles.marqueeContent}>
            {marqueeRow2.map((item, idx) => (
              <Card key={`r2-${idx}`} className={styles.reviewCard}>
                <CardContent className={styles.reviewContent}>
                  <p className={styles.reviewText}>{item.text}</p>
                  <div className={styles.reviewer}>
                    <div className={styles.avatar}>{item.avatar}</div>
                    <div className={styles.reviewerInfo}>
                      <h4 className={styles.reviewerName}>{item.name}</h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
