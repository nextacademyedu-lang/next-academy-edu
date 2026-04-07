import { createClient } from '@/utils/supabase/server';
import EmailSettingsForm from './EmailSettingsForm';
import styles from './EmailSettings.module.css';

export default async function EmailSettingsPage() {
    const supabase = await createClient();
    const { data: settings } = await supabase
        .from('email_settings')
        .select('*')
        .order('source', { ascending: true });

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Email Automation Settings</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Configure the sender email and subject line for each form source. Note: Sender emails must be verified in Resend (e.g., your @muhammedmekky.com domain).
            </p>

            {settings ? settings.map((setting) => (
                <div key={setting.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {setting.source.replace('_', ' ')}
                        </h2>
                        <span className={styles.sourceBadge}>{setting.source}</span>
                    </div>
                    <EmailSettingsForm setting={setting} />
                </div>
            )) : (
                <p>Loading settings...</p>
            )}
        </div>
    );
}
