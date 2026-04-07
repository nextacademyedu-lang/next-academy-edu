'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminForm.module.css';

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'checkbox' | 'date';
    required?: boolean;
    helperText?: string;
    placeholder?: string;
}

interface AdminFormProps {
    title: string;
    action: (formData: FormData) => Promise<{ error?: string; success?: boolean }>;
    fields: FieldConfig[];
    initialData?: any;
    backLink: string;
}

export default function AdminForm({ title, action, fields, initialData, backLink }: AdminFormProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const form = e.currentTarget;
        const formData = new FormData(form);

        // Handle checkboxes explicitly if they are unchecked (FormData natively omits them)
        // We will just let the action handle omitted checked = false, but if `initialData` existed,
        // it might be safer to explicitly append them if the user unchecked them, but formData.get() returning null 
        // works perfectly for our actions since we check `=== 'true'`. We just ensure checked checkboxes pass 'true'
        // by setting value="true" on the input.

        startTransition(async () => {
            const res = await action(formData);
            if (res.error) {
                setError(res.error);
            } else {
                router.push(backLink);
                router.refresh();
            }
        });
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Pass ID if editing */}
                {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

                <div className={styles.fieldsGrid}>
                    {fields.map((field) => (
                        <div key={field.name} className={styles.formGroup}>
                            <label htmlFor={field.name} className={styles.label}>
                                {field.label} {field.required && <span className={styles.required}>*</span>}
                            </label>

                            {field.type === 'textarea' ? (
                                <textarea
                                    id={field.name}
                                    name={field.name}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    defaultValue={
                                        // For arrays, join them back with newlines to edit
                                        Array.isArray(initialData?.[field.name])
                                            ? initialData[field.name].join('\n')
                                            : initialData?.[field.name] || ''
                                    }
                                    className={styles.textarea}
                                    rows={5}
                                />
                            ) : field.type === 'checkbox' ? (
                                <div className={styles.checkboxWrapper}>
                                    <input
                                        type="checkbox"
                                        id={field.name}
                                        name={field.name}
                                        value="true"
                                        defaultChecked={initialData ? !!initialData[field.name] : true} // default to checked for new posts (like "published")
                                        className={styles.checkbox}
                                    />
                                    <span className={styles.checkboxLabel}>Enable/Active</span>
                                </div>
                            ) : (
                                <input
                                    type={field.type}
                                    id={field.name}
                                    name={field.name}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    defaultValue={
                                        field.type === 'date' && initialData?.[field.name]
                                            ? new Date(initialData[field.name]).toISOString().split('T')[0]
                                            : initialData?.[field.name] || ''
                                    }
                                    className={styles.input}
                                />
                            )}

                            {field.helperText && (
                                <p className={styles.helperText}>{field.helperText}</p>
                            )}
                        </div>
                    ))}
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={() => router.push(backLink)}
                        className={styles.cancelBtn}
                        disabled={isPending}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isPending}
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
