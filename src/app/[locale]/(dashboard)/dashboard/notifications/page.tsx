"use client";

import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserNotifications, type PayloadNotification } from '@/lib/dashboard-api';

const NOTIFICATION_ACCENT: Record<string, string> = {
  booking_confirmed:      '#00e397',
  payment_received:       '#00e397',
  payment_reminder:       '#ffc107',
  round_starting:         '#1877F2',
  session_reminder:       '#1877F2',
  booking_cancelled:      '#ff4d4f',
  round_cancelled:        '#ff4d4f',
  consultation_confirmed: '#00e397',
  consultation_reminder:  '#1877F2',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<PayloadNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserNotifications().then(res => {
      if (res.success && res.data) setNotifications(res.data.docs);
      setLoading(false);
    });
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCheck size={16} /> Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      <Card style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} /> All Notifications
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: 0 }}>
          {loading ? (
            <p style={{ padding: '32px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading…</p>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Bell size={40} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>No notifications yet.</p>
            </div>
          ) : notifications.map((n, i) => {
            const accent = NOTIFICATION_ACCENT[n.type] ?? '#555';
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: n.isRead ? 'transparent' : 'rgba(255,255,255,0.02)',
                  borderLeft: `3px solid ${n.isRead ? 'transparent' : accent}`,
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ paddingTop: '4px', flexShrink: 0 }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: n.isRead ? 'transparent' : accent,
                    border: n.isRead ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    marginTop: '4px',
                  }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ fontSize: '15px', fontWeight: n.isRead ? 400 : 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {n.title}
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    title="Mark as read"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', flexShrink: 0 }}
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
