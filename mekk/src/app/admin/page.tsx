import { createClient } from '@/utils/supabase/server';
import styles from './Dashboard.module.css';

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Fetch contacts
    const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch subscriptions
    const { data: subscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard Overview</h1>
                <p className={styles.subtitle}>Welcome back, Admin. Here are your latest interactions.</p>
            </div>

            <div className={styles.grid}>
                {/* Contacts Section */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Recent Messages</h2>
                    {contactsError && <p className={styles.error}>Failed to load contacts.</p>}

                    {!contacts || contacts.length === 0 ? (
                        <p className={styles.empty}>No messages yet.</p>
                    ) : (
                        <div className={styles.list}>
                            {contacts.map((contact) => (
                                <div key={contact.id} className={styles.listItem}>
                                    <div className={styles.itemHeader}>
                                        <span className={styles.itemName}>{contact.name}</span>
                                        <a href={`mailto:${contact.email}`} className={styles.itemEmail}>{contact.email}</a>
                                        <span style={{ marginLeft: 'auto', marginRight: '1rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {contact.source || 'contact_page'}
                                        </span>
                                        <span className={styles.itemDate}>
                                            {new Date(contact.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className={styles.itemMessage}>{contact.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subscriptions Section */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Newsletter Subscribers</h2>
                    {subsError && <p className={styles.error}>Failed to load subscriptions.</p>}

                    {!subscriptions || subscriptions.length === 0 ? (
                        <p className={styles.empty}>No subscribers yet.</p>
                    ) : (
                        <div className={styles.list}>
                            {subscriptions.map((sub) => (
                                <div key={sub.id} className={styles.listItem}>
                                    <div className={styles.itemHeader}>
                                        <a href={`mailto:${sub.email}`} className={styles.itemEmail}>{sub.email}</a>
                                        <span style={{ marginLeft: 'auto', marginRight: '1rem', padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            {sub.source || 'newsletter'}
                                        </span>
                                        <span className={styles.itemDate}>
                                            {new Date(sub.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
