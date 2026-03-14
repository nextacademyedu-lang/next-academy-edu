import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import styles from './text-testimonials.module.css';

const TEXT_TESTIMONIALS = [
  {
    text: "Absolutely revolutionary, a game-changer for our industry. It has streamlined our processes and enhanced our productivity dramatically.",
    name: "Bob Smith",
    role: "Industry Analyst",
    avatar: "BS"
  },
  {
    text: "I can't imagine going back to how things were before. It has not only improved my work but also my daily life.",
    name: "Cathy Lee",
    role: "Product Manager",
    avatar: "CL"
  },
  {
    text: "It seamlessly integrates into our workflow. It eliminates complex setups and allowed us to focus on growth.",
    name: "John Doe",
    role: "CEO at TechFlow",
    avatar: "JD"
  },
  {
    text: "It's incredibly intuitive and easy to use. Even those without technical expertise can leverage its power to improve their workflows.",
    name: "Grace Hall",
    role: "Marketing Specialist",
    avatar: "GH"
  },
  {
    text: "It has saved us countless hours. I recommend this to anyone looking to scale operations.",
    name: "Henry Ford",
    role: "Operations Director",
    avatar: "HF"
  }
];

export function TextTestimonialsSection() {
  const marqueeRow1 = [...TEXT_TESTIMONIALS, ...TEXT_TESTIMONIALS];
  const marqueeRow2 = [...TEXT_TESTIMONIALS.slice(2), ...TEXT_TESTIMONIALS.slice(0, 2), ...TEXT_TESTIMONIALS.slice(2), ...TEXT_TESTIMONIALS.slice(0, 2)];

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
                      <p className={styles.reviewerRole}>{item.role}</p>
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
                      <p className={styles.reviewerRole}>{item.role}</p>
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
