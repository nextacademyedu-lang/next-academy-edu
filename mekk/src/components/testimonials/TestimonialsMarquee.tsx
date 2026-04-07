'use client';

import { useRef } from 'react';
import { TESTIMONIALS } from '@/lib/constants';
import styles from './TestimonialsMarquee.module.css';

const EXTRA_TESTIMONIALS = [
    { quote: 'The automation framework he built for us saved 30+ hours per week. Pure business intelligence.', author: 'Khaled R.', role: 'Digital Agency Owner', rating: 5 },
    { quote: 'His workshops changed how our team thinks about AI. We went from skeptics to power users in 2 days.', author: 'Lina H.', role: 'Head of Marketing', rating: 5 },
    { quote: 'Mekky built our entire CRM automation from scratch. ROI was visible within the first week.', author: 'Fathi A.', role: 'SaaS Founder', rating: 5 },
    { quote: 'The portfolio workshop gave me frameworks I still use daily. Worth every minute.', author: 'Nour S.', role: 'Freelance Designer', rating: 5 },
    { quote: 'Never met someone who explains complex automation concepts with such clarity.', author: 'Rami T.', role: 'Product Manager', rating: 5 },
    { quote: 'He doesn\'t just teach theory — he builds alongside you. That\'s what makes the difference.', author: 'Dina M.', role: 'Business Consultant', rating: 5 },
];

const ALL = [...TESTIMONIALS, ...EXTRA_TESTIMONIALS];

// Split into 3 rows
const ROW_1 = ALL.slice(0, Math.ceil(ALL.length / 3));
const ROW_2 = ALL.slice(Math.ceil(ALL.length / 3), Math.ceil((ALL.length * 2) / 3));
const ROW_3 = ALL.slice(Math.ceil((ALL.length * 2) / 3));

function Card({ quote, author, role, rating }: { quote: string; author: string; role: string; rating: number }) {
    return (
        <div className={styles.card}>
            <div className={styles.stars}>
                {'★'.repeat(rating)}
            </div>
            <p className={styles.quote}>&ldquo;{quote}&rdquo;</p>
            <div className={styles.author}>
                <span className={styles.authorName}>{author}</span>
                <span className={styles.authorRole}>{role}</span>
            </div>
        </div>
    );
}

function MarqueeRow({ items, reverse = false }: { items: typeof ALL; reverse?: boolean }) {
    // Duplicate for seamless loop
    const doubled = [...items, ...items];
    return (
        <div className={styles.row}>
            <div
                className={`${styles.track} ${reverse ? styles.trackReverse : ''}`}
                style={{ '--count': doubled.length } as React.CSSProperties}
            >
                {doubled.map((t, i) => (
                    <Card key={i} {...t} />
                ))}
            </div>
        </div>
    );
}

export default function TestimonialsMarquee() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <section ref={sectionRef} className={styles.section}>
            <div className={styles.topLabel}>
                <span className={styles.label}>● Client Voices</span>
            </div>
            <MarqueeRow items={ROW_1} />
            <MarqueeRow items={ROW_2} reverse />
            <MarqueeRow items={ROW_3} />
        </section>
    );
}
