'use client';

import { useState } from 'react';
import { seedDatabase } from './actions';
import styles from './Seed.module.css';

export default function SeedButton() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSeed = async () => {
        if (!confirm("Are you sure? This will upsert existing static data into Supabase.")) return;

        setStatus('loading');
        const res = await seedDatabase();

        if (res.error) {
            setStatus('error');
            setMessage(res.error);
        } else {
            setStatus('success');
            setMessage("Database seeded successfully with all Projects, Blogs, and Case Studies!");
        }
    };

    return (
        <div className={styles.container}>
            <button
                onClick={handleSeed}
                disabled={status === 'loading'}
                className={styles.button}
            >
                {status === 'loading' ? 'Seeding Database...' : 'Seed Now'}
            </button>

            {status === 'success' && <p className={styles.success}>{message}</p>}
            {status === 'error' && <p className={styles.error}>{message}</p>}
        </div>
    );
}
