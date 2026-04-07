import SeedButton from './SeedButton';
import styles from './Seed.module.css';

export default function SeedPage() {
    return (
        <div className={styles.page}>
            <h1 className={styles.title}>Database Setup & Migration</h1>
            <p className={styles.description}>
                Click the button below to parse all existing static content (Projects, Blogs, Case Studies) from <code>constants.ts</code> and sync them directly into the newly created Supabase tables.
            </p>
            <div className={styles.card}>
                <SeedButton />
            </div>
        </div>
    );
}
