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
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
          zIndex: 9000, display: 'flex', alignItems: 'center', gap: '8px',
          background: toast.type === 'success' ? '#1a3a1a' : '#3a1a1a',
          color:      toast.type === 'success' ? '#4ade80' : '#f87171',
          border:     `1px solid ${toast.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
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
            <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '8px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, rgba(255,255,255,0.2) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '28px', fontWeight: 700, color: '#fff',
                    }}>
                      {avatarInitial}
                    </div>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className={styles.formGridRow}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Label htmlFor="email">Email Address</Label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <Input
                        id="email"
                        value={user?.email ?? ''}
                        style={{ paddingLeft: '40px' }}
                        disabled
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Email cannot be changed here.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                        placeholder="+20 100 000 0000"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <Button type="submit" variant="primary" disabled={saving}>
                      {saving ? <><Loader2 size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />Saving…</> : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {tab === 'security' && (
            <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Use a long, random password to stay secure.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                  <div style={{ marginTop: '8px' }}>
                    <Button type="submit" variant="primary" disabled={changingPwd}>
                      {changingPwd ? <><Loader2 size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />Updating…</> : 'Update Password'}
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
