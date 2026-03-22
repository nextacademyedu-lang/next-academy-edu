'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import styles from './text-testimonials.module.css';

type Testimonial = {
  text: string;
  name: string;
  avatar: string;
  rating: number;
};

export function TextTestimonialsSection() {
  const locale = useLocale();
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

  const baseTestimonials = testimonials.length >= 4
    ? testimonials
    : Array.from({ length: 4 }, (_, index) => testimonials[index % testimonials.length]);

  const marqueeRow1 = [...baseTestimonials, ...baseTestimonials];
  const shifted = [...baseTestimonials.slice(1), ...baseTestimonials.slice(0, 1)];
  const marqueeRow2 = [...shifted, ...shifted];

  const isArabic = locale.startsWith('ar');
  const copy = isArabic
    ? {
      badge: 'آراء متدربين',
      title: 'تجارب حقيقية من داخل البرامج',
      subtitle: 'كل رأي يظهر هنا بعد مراجعة واعتماد من فريق الإدارة.',
      verified: 'عميل موثق',
      ratingLabel: 'من 5',
    }
    : {
      badge: 'Student Voices',
      title: 'Real Feedback From Real Learners',
      subtitle: 'Only admin-approved reviews are displayed in this section.',
      verified: 'Verified learner',
      ratingLabel: 'out of 5',
    };

  return (
    <section className={styles.section} aria-labelledby="testimonials-heading">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.badge}>{copy.badge}</span>
          <h2 id="testimonials-heading" className={styles.title}>{copy.title}</h2>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </div>

        <div className={styles.marqueeContainer}>
          <div className={styles.marqueeRow}>
            <div className={styles.marqueeContent}>
              {marqueeRow1.map((item, idx) => (
                <Card key={`r1-${idx}`} className={styles.reviewCard}>
                  <CardContent className={styles.reviewContent}>
                    <div className={styles.quoteMark}>“</div>
                    <div className={styles.rating} aria-label={`${item.rating} ${copy.ratingLabel}`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < item.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </div>
                    <p className={styles.reviewText}>{item.text}</p>
                    <div className={styles.reviewer}>
                      <div className={styles.avatar}>{item.avatar}</div>
                      <div className={styles.reviewerInfo}>
                        <h4 className={styles.reviewerName} title={item.name}>{item.name}</h4>
                        <p className={styles.reviewerMeta}>{copy.verified}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className={`${styles.marqueeRow} ${styles.reverseRow}`}>
            <div className={styles.marqueeContent}>
              {marqueeRow2.map((item, idx) => (
                <Card key={`r2-${idx}`} className={styles.reviewCard}>
                  <CardContent className={styles.reviewContent}>
                    <div className={styles.quoteMark}>“</div>
                    <div className={styles.rating} aria-label={`${item.rating} ${copy.ratingLabel}`}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < item.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </div>
                    <p className={styles.reviewText}>{item.text}</p>
                    <div className={styles.reviewer}>
                      <div className={styles.avatar}>{item.avatar}</div>
                      <div className={styles.reviewerInfo}>
                        <h4 className={styles.reviewerName} title={item.name}>{item.name}</h4>
                        <p className={styles.reviewerMeta}>{copy.verified}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.marqueeContainerMobile}>
        <div className={styles.marqueeContent}>
          {marqueeRow1.map((item, idx) => (
            <Card key={`m-${idx}`} className={styles.reviewCard}>
              <CardContent className={styles.reviewContent}>
                <div className={styles.quoteMark}>“</div>
                <div className={styles.rating} aria-label={`${item.rating} ${copy.ratingLabel}`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < item.rating ? styles.starFilled : styles.starEmpty}>★</span>
                  ))}
                </div>
                <p className={styles.reviewText}>{item.text}</p>
                <div className={styles.reviewer}>
                  <div className={styles.avatar}>{item.avatar}</div>
                  <div className={styles.reviewerInfo}>
                    <h4 className={styles.reviewerName} title={item.name}>{item.name}</h4>
                    <p className={styles.reviewerMeta}>{copy.verified}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
