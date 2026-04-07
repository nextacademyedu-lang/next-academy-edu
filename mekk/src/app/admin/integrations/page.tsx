import { getGoogleTokens, getAuthenticatedCalendar } from '@/utils/google';
import s from '../Scheduling.module.css';
import Link from 'next/link';

export const metadata = { title: 'Integrations | Admin' };

export default async function IntegrationsPage() {
    const tokens = await getGoogleTokens();
    let connected = false;
    let email = '';

    if (tokens) {
        try {
            const cal = await getAuthenticatedCalendar();
            if (cal) {
                const r = await cal.calendars.get({ calendarId: 'primary' });
                connected = true;
                email = r.data.id || 'Connected';
            }
        } catch { /* tokens expired */ }
    }

    return (
        <div>
            <div className={s.pageHeader}>
                <div>
                    <h1 className={s.pageTitle}>Integrations</h1>
                    <p className={s.pageSub}>Connect your calendar and conferencing tools</p>
                </div>
            </div>

            <div className={s.scheduleCard}>
                <div className={s.scheduleHeader} style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <div className={s.scheduleHeaderTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0069ff" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Google Calendar
                        </div>
                        <div className={s.scheduleHeaderSub}>Check for conflicts &amp; auto-create Google Meet links</div>
                    </div>
                    <div>
                        {connected ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                                <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%' }} />
                                Connected
                            </span>
                        ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.7rem', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600 }}>
                                Not Connected
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ padding: '1.25rem 1.5rem' }}>
                    {connected ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
                                Account: <strong style={{ color: '#fff' }}>{email}</strong>
                            </span>
                            <Link href="/api/auth/google" className={s.btnOutline}>Re-authenticate</Link>
                        </div>
                    ) : (
                        <>
                            <Link href="/api/auth/google" className={s.btnPrimary}>Connect Google Calendar</Link>
                            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#facc15', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)', padding: '0.75rem', borderRadius: 8 }}>
                                <strong>Setup:</strong> Ensure <code>http://localhost:3000/api/auth/google/callback</code> (local) or <code>https://muhammedmekky.com/api/auth/google/callback</code> (prod) is in authorized redirect URIs on Google Cloud Console.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
