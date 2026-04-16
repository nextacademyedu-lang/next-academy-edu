'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import styles from './delete-account-modal.module.css';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('Auth');

  const handleConfirm = async () => {
    if (confirmText !== 'DELETE') return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete account');
      }

      // Success! Clear state and redirect
      onClose();
      router.push(`/${locale}`);
      router.refresh();
      
      // Force reload to clear all states
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <h2 className={styles.title}>{t('deleteAccountTitle')}</h2>
            
            <p className={styles.warning}>
              {t('deleteWarning')}
            </p>

            <span className={styles.instruction}>
              {t('deleteConfirmText')}
            </span>

            <Input
              type="text"
              className={styles.input}
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              autoFocus
            />

            {error && (
              <p className={styles.error} style={{ color: 'red', marginBottom: '16px', textAlign: 'center', fontSize: '13px' }}>
                {error}
              </p>
            )}

            <div className={styles.actions}>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isDeleting}
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                className={styles.deleteBtn}
                onClick={handleConfirm}
                disabled={confirmText !== 'DELETE' || isDeleting}
              >
                {isDeleting ? t('deleting') : t('deleteAccountBtn')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
