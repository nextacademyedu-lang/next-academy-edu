'use client';

import { useState } from 'react';
import { updateEmailSettings } from './actions';
import styles from './EmailSettings.module.css';

interface SettingProps {
    setting: {
        id: string;
        source: string;
        sender_email: string;
        subject: string;
        body_text?: string;
    }
}

export default function EmailSettingsForm({ setting }: SettingProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSubmit = async (formData: FormData) => {
        setStatus("loading");
        const res = await updateEmailSettings(formData);

        if (res?.error) {
            setStatus("error");
        } else {
            setStatus("success");
            setTimeout(() => setStatus("idle"), 3000);
        }
    };

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={setting.id} />

            <div className={styles.formGroup}>
                <label className={styles.label}>Sender Email (From)</label>
                <input
                    type="text"
                    name="sender_email"
                    defaultValue={setting.sender_email}
                    className={styles.input}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Email Subject</label>
                <input
                    type="text"
                    name="subject"
                    defaultValue={setting.subject}
                    className={styles.input}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Email Body (Supports HTML - overrides default design if filled)</label>
                <textarea
                    name="body_text"
                    defaultValue={setting.body_text || ""}
                    className={styles.input}
                    rows={12}
                    placeholder="Paste your full HTML template here. You can use dynamic variables like {{name}} or {{email}}. Leave empty to use the default React Email template."
                />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={status === "loading"}>
                {status === "loading" ? "Saving..." : "Save Changes"}
            </button>

            {status === "success" && <div className={styles.successMsg}>Settings updated successfully.</div>}
            {status === "error" && <div className={styles.errorMsg}>Error saving settings.</div>}
        </form>
    );
}
