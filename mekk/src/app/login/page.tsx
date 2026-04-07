'use client';

import { useState } from 'react';
import { login } from '@/app/api/auth/actions';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleLogin(formData: FormData) {
        setStatus("loading");
        const result = await login(formData);

        if (result?.error) {
            setStatus("error");
            setErrorMsg(result.error);
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>Admin Login</h1>
                <p className={styles.subtitle}>Enter your credentials to access the dashboard.</p>

                <form action={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input type="email" name="email" placeholder="Email" required className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <input type="password" name="password" placeholder="Password" required className={styles.input} />
                    </div>
                    <button type="submit" disabled={status === 'loading'} className={styles.submitButton}>
                        {status === 'loading' ? 'Authenticating...' : 'Sign In'}
                    </button>
                    {status === 'error' && <p className={styles.errorText}>{errorMsg}</p>}
                </form>
            </div>
        </div>
    );
}
