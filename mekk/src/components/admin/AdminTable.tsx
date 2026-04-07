import Link from 'next/link';
import DeleteActionForm from './DeleteActionForm';
import styles from './AdminTable.module.css';

interface AdminTableProps {
    title: string;
    description: string;
    items: any[];
    baseRoute: string;
    onDelete: (id: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function AdminTable({ title, description, items, baseRoute, onDelete }: AdminTableProps) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.description}>{description}</p>
                </div>
                <Link href={`${baseRoute}/new`} className={styles.newButton}>
                    Create New
                </Link>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={4} className={styles.empty}>
                                    No items found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            items.map((item) => (
                                <tr key={item.id || item.slug}>
                                    <td className={styles.primaryCell}>{item.title}</td>
                                    <td className={styles.secondaryCell}>{item.slug}</td>
                                    <td>
                                        <span className={`${styles.badge} ${item.published ? styles.badgeActive : styles.badgeInactive}`}>
                                            {item.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <Link href={`${baseRoute}/${item.id}`} className={styles.editBtn}>
                                            Edit
                                        </Link>
                                        <DeleteActionForm
                                            action={onDelete}
                                            id={item.id}
                                            className={styles.deleteBtn}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
