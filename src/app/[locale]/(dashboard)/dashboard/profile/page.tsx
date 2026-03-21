"use client";

import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Phone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { updateUserProfile, changeUserPassword } from '@/lib/dashboard-api';
import styles from './profile.module.css';

type Toast = { type: 'success' | 'error'; message: string } | null;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'general' | 'security'>('general');

  // General form state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [saving,    setSaving]    = useState(false);

  // Security form state
  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPwd,     setChangingPwd]     = useState(false);

  const [toast, setToast] = useState<Toast>(null);

  // Pre-fill from auth context
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const res = await updateUserProfile(user.id, { firstName, lastName, phone });
    setSaving(false);
    if (res.success) {
      await refreshUser();
      showToast('success', 'Profile updated successfully.');
    } else {
      showToast('error', res.error ?? 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match.');
      return;
    }
    setChangingPwd(true);
    const res = await changeUserPassword(user.id, newPassword);
    setChangingPwd(false);
    if (res.success) {
      setNewPassword('');
      setConfirmPassword('');
      showToast('success', 'Password updated successfully.');
    } else {
      showToast('error', res.error ?? 'Failed to update password.');
    }
  };

  const avatarInitial = user?.firstName?.[0]?.toUpperCase() ?? '?';

  return (
    <div className={styles.container}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className={styles.toastIcon} /> : <AlertCircle size={16} className={styles.toastIcon} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>Manage your account details and security preferences.</p>
      </div>

      <div className={styles.layout}>

        {/* Sidebar Nav */}
        <div className={styles.nav}>
          <button onClick={() => setTab('general')} className={`${styles.navBtn} ${tab === 'general' ? styles.active : ''}`}>
            <User size={18} /> General Information
          </button>
          <button onClick={() => setTab('security')} className={`${styles.navBtn} ${tab === 'security' ? styles.active : ''}`}>
            <Lock size={18} /> Security & Password
          </button>
        </div>

        {/* Content */}
        <div className={styles.contentArea}>

          {/* General Tab */}
          {tab === 'general' && (
            <Card className={styles.panelCard}>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className={styles.formStack}>

                  {/* Avatar */}
                  <div className={styles.avatarRow}>
                    <div className={styles.avatar}>
                      {avatarInitial}
                    </div>
                    <div>
                      <p className={styles.identityName}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className={styles.identityEmail}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className={styles.formGridRow}>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.fieldBlock}>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.fieldBlock}>
                    <Label htmlFor="email">Email Address</Label>
                    <div className={styles.fieldWithIcon}>
                      <Mail size={16} color="var(--text-muted)" className={styles.inputIcon} />
                      <Input
                        id="email"
                        value={user?.email ?? ''}
                        className={styles.withIconInput}
                        disabled
                      />
                    </div>
                    <p className={styles.fieldHint}>Email cannot be changed here.</p>
                  </div>

                  <div className={styles.fieldBlock}>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className={styles.fieldWithIcon}>
                      <Phone size={16} color="var(--text-muted)" className={styles.inputIcon} />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className={styles.withIconInput}
                        placeholder="+20 100 000 0000"
                      />
                    </div>
                  </div>

                  <div className={styles.actionsRow}>
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <><Loader2 size={16} className={styles.spinningIcon} />Saving…</> : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <Card className={styles.panelCard}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Use a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className={styles.formStack}>
                  <div className={styles.fieldBlock}>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                    />
                  </div>
                  <div className={styles.fieldBlock}>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                  <div className={styles.actionsRow}>
                    <Button type="submit" variant="primary" disabled={changingPwd}>
                      {changingPwd ? <><Loader2 size={16} className={styles.spinningIcon} />Updating…</> : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
