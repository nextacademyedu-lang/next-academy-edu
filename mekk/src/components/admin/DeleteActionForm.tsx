'use client';

import { useTransition } from 'react';

export default function DeleteActionForm({
    action,
    id,
    className
}: {
    action: (id: string) => Promise<{ error?: string, success?: boolean }>;
    id: string;
    className?: string;
}) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

        startTransition(async () => {
            const res = await action(id);
            if (res.error) {
                alert(`Error deleting: ${res.error}`);
            }
        });
    };

    return (
        <button
            type="button"
            className={className}
            onClick={handleDelete}
            disabled={isPending}
        >
            {isPending ? 'Deleting...' : 'Delete'}
        </button>
    );
}
